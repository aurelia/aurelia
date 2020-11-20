import { IEntity, IRepository } from './contracts';
import { Database } from './database';

export abstract class BaseRepository<TEntity extends IEntity> implements IRepository<TEntity> {

  protected collection: TEntity[];

  protected constructor(
    protected readonly database: Database,
    dbSetSelector: (db: Database) => TEntity[],
  ) {
    this.collection = dbSetSelector(database);
  }
  public abstract createRandom(): TEntity;

  public create(entity?: TEntity): void {
    this.collection.push(entity ?? this.createRandom());
  }

  public all(): TEntity[] {
    return this.collection;
  }

  public find(id: number): TEntity | undefined {
    return this.collection.find((e) => e.id === id);
  }

  public update(id: number, entity: TEntity): void {
    const { existing, idx } = this.findCore(id, true);
    this.updateCore(entity, existing, idx);
  }

  public delete(id: number): void {
    const { existing, idx } = this.findCore(id, true);
    this.deleteCore(idx, existing);
  }

  public removeAll(): void {
    this.collection = [];
  }

  // hook so that the derived classes can handle interesting parts of the update;
  // such as updating navigational properties
  protected updateCore(
    entity: TEntity,
    existing: TEntity,
    idx: number,
  ): void {
    entity.id = existing.id;
    this.collection.splice(idx, 1, entity);
  }

  // hook so that the derived classes can handle interesting parts of the delete;
  // such as deleting navigational properties
  protected deleteCore(
    idx: number,
    _existing: TEntity,
  ): void {
    this.collection.splice(idx, 1);
  }

  private findCore(id: number, assert: boolean): { existing: TEntity; idx: number } {
    let idx: number = -1;
    const existing = this.collection.find((e, i) => {
      idx = i;
      return e.id === id;
    });

    if (assert && existing === void 0) {
      throw new Error('Not Found');
    }
    return { existing: existing!, idx };
  }

}
