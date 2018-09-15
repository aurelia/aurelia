import project from "./project";
import { createContainer, uploadFile } from "./azure-storage";
import { readdirSync } from "fs";
import { join } from "path";

async function upload() {
  const args = process.argv.slice(2);
  const target = args[0];
  const containerName = 'releases';
  await createContainer(containerName); // no-op when the container already exists

  const unversionedPrefix = `${target}`;
  const versionedPrefix = `${unversionedPrefix}/${project.lerna.version}`;
  const files = readdirSync(project.dist.path);
  for (const prefix of [unversionedPrefix, versionedPrefix]) {
    for (const file of files) {
      const filePath = join(project.dist.path, file);
      const fileName = `${prefix}/${file}`;
      await uploadFile(containerName, fileName, filePath);
    }
  }
}

upload();
