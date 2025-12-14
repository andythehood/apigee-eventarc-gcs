/*
  Copyright 2025 Aviato Consulting

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      https://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
import { Bucket } from "@google-cloud/storage";
import unzipper from "unzipper";

import { log } from "./utils";

// Basic content-type helper
const guessContentType = (file: string) => {
  if (file.endsWith(".xml")) return "application/xml";
  if (file.endsWith(".json")) return "application/json";
  if (file.endsWith(".js")) return "application/javascript";
  if (file.endsWith(".txt")) return "text/plain";
  return "application/octet-stream";
}

export const saveZip = async (
  bucket: Bucket,
  type: string,
  name: string,
  revision: string,
  data: Buffer
) => {

  const folderPrefix = `${type}/${name}/${revision}`;
  const path = `${folderPrefix}/${name}_rev${revision}.zip`;
  const file = bucket.file(path);

  await file.save(data, { contentType: "application/zip" });

  const directory = await unzipper.Open.buffer(data);

  // Upload each entry
  await Promise.all(
    directory.files.map(async file => {
      if (file.type === "File") {
        const contents = await file.buffer();

        const fullPath = `${folderPrefix}/${file.path}`;  // keeps folder structure
        console.log(`Uploading: ${fullPath}`);

        await bucket.file(fullPath).save(contents, {
          resumable: false,
          contentType: guessContentType(file.path),
        });
      }
    })
  );

  log(`Saved ZIP: gs://${bucket.name}/${path}`);
}

export const saveMetadata = async (
  bucket: Bucket,
  type: string,
  name: string,
  revision: string,
  metadata: Record<string, any>,
  deleted: boolean = false
) => {
  const path = `${type}/${name}/${revision}/metadata.json`;
  const file = bucket.file(path);

  await file.save(JSON.stringify(metadata, null, 2), {
    contentType: "application/json"
  });

  if (deleted) {
    const marker = bucket.file(`${type}/${name}/${revision}/DELETED`);
    await marker.save("");
  }

  log(`Saved metadata: ${path}`);
}

export const archive = async (
  bucket: Bucket,
  type: string,
  name: string
) => {

  const prefix = `${type}/${name}/`;
  const archivePrefix = `${type}/zzARCHIVE/${name}/`;

  const [files] = await bucket.getFiles({ prefix });

  await Promise.all(
    files.map(file => {
      const destination = file.name.replace(prefix, archivePrefix);
      log(`Archiving: ${file.name} → ${destination}`);
      return file.move(destination);
    })
  );

  // archivePrefix already has a trailing slash
  const marker = bucket.file(`${archivePrefix}DELETED`);
  await marker.save("");

  log(`Archived: ${type}/${name}`);
}
