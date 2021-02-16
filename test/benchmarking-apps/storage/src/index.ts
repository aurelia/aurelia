import { CosmosClient } from '@azure/cosmos';
import { BenchmarkMeasurements, BenchmarkMetadata, IStorage, Measurement, StorageConfig } from "@benchmarking-apps/test-result";
import { lstatSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { extname, join } from 'path';

export * from "@benchmarking-apps/test-result";

class JsonFileStorage implements IStorage {
  public readonly type: 'json' = 'json';
  public readonly measurements: Measurement[] = [];

  public constructor(
    public readonly resultRoot: string
  ) {
    if (!resultRoot) {
      throw new Error('Missing result root path.');
    }
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public persist(batchId: string, metadata: BenchmarkMetadata): void {
    const fileName = join(this.resultRoot, `${batchId}.json`);
    writeFileSync(fileName, JSON.stringify({
      ...metadata,
      measurements: this.measurements,
    }, undefined, 2), 'utf8');
    console.log(`The results are written to ${fileName}.`);
  }

  public getLatestBenchmarkResult(branch?: string, commit?: string): Promise<Partial<BenchmarkMeasurements>> {
    const hasBranch = branch !== void 0;
    const hasCommit = commit !== void 0;
    let latestResult: string | Partial<BenchmarkMeasurements> = (void 0)!;
    let timestamp = -1;
    const root = this.resultRoot;
    for (const file of readdirSync(root, 'utf8')) {
      if (extname(file) !== '.json') { continue; }
      const filePath = join(root, file);
      let temp: Partial<BenchmarkMeasurements> | null = null;
      if (hasBranch || hasCommit) {
        temp = JSON.parse(readFileSync(filePath, 'utf8')) as Partial<BenchmarkMeasurements>;
        if ((hasBranch && temp.branch !== branch) || (hasCommit && !temp.commit?.startsWith(commit!))) {
          temp = null;
          continue;
        }
      }
      const stat = lstatSync(filePath);
      const newTimestamp = Math.max(timestamp, stat.birthtimeMs);
      if (newTimestamp !== timestamp) {
        timestamp = newTimestamp;
        latestResult = temp ?? filePath;
      }
    }
    if (latestResult === void 0) {
      throw new NotFoundError(`No benchmark result found${hasBranch ? ` for branch ${branch!}` : ''}${hasCommit ? ` at ${commit!}` : ''}`);
    }
    return Promise.resolve(typeof latestResult === 'object'
      ? latestResult
      : JSON.parse(readFileSync(latestResult, 'utf8')) as Partial<BenchmarkMeasurements>
    );
  }

  public async getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]> {
    const results: Partial<BenchmarkMeasurements>[] = [];
    const root = this.resultRoot;
    for (const file of readdirSync(root, 'utf8')) {
      if (extname(file) !== '.json') { continue; }
      results.push(JSON.parse(readFileSync(join(root, file), 'utf8')));
    }
    return Promise.resolve(results);
  }
}
class CosmosStorage implements IStorage {
  public readonly type: 'cosmos' = 'cosmos';
  public readonly measurements: Measurement[] = [];
  private readonly client: CosmosClient;

  public constructor(
    endpoint: string,
    key: string
  ) {
    if (!endpoint || !key) {
      throw new Error('Missing cosmos endpoint or key.');
    }
    this.client = new CosmosClient({ endpoint, key });
  }

  public addMeasurements(...measurements: Measurement[]): void {
    this.measurements.push(...measurements);
  }

  public async persist(batchId: string, metadata: BenchmarkMetadata): Promise<void> {
    const database = (await this.client.databases.createIfNotExists({ id: 'benchmarks' })).database;
    const container = (await database.containers.createIfNotExists({ id: 'measurements' })).container;
    await container.items.create({
      ...metadata,
      id: batchId,
      measurements: this.measurements,
    });
    console.log(`Persisted the result for batch ${batchId} in cosmos DB.`);
  }

  public async getLatestBenchmarkResult(branch: string = 'master', commit: string | undefined = void 0): Promise<Partial<BenchmarkMeasurements>> {
    const hasCommit = commit !== void 0;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const measurements = (await this.client
      .database('benchmarks')
      .container('measurements')
      .items
      .query(`SELECT * FROM measurements m WHERE m.branch = "${branch}"${hasCommit ? ` AND m.commit LIKE "${commit!}%" ` : ' '}ORDER BY m.ts_start DESC LIMIT 1`)
      .fetchAll()
    ).resources[0];
    if (measurements === void 0) {
      throw new NotFoundError(`No benchmark result found for branch ${branch}${hasCommit ? ` at ${commit!}` : ''}`);
    }
    return measurements as Partial<BenchmarkMeasurements>;
  }

  public async getAllBenchmarkResults(): Promise<Partial<BenchmarkMeasurements>[]> {
    return (await this.client
      .database('benchmarks')
      .container('measurements')
      .items
      .readAll()
      .fetchAll()
    ).resources;
  }
}

export enum Storages {
  json,
  cosmos
}
export function getNewStorageFor(
  storage: Storages,
  options: StorageConfig
): IStorage {
  switch (storage) {
    case Storages.json:
      return new JsonFileStorage(options.resultRoot!);
    case Storages.cosmos:
      return new CosmosStorage(options.cosmosEndpoint!, options.cosmosKey!);
  }
}

export class NotFoundError extends Error { }
