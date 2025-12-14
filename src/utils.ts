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
import JSZip from 'jszip';
import { XMLParser, XMLBuilder } from 'fast-xml-parser';

const parser = new XMLParser({ ignoreAttributes: false });
const builder = new XMLBuilder({ ignoreAttributes: false, format: true });

/**
 * Modifies a specific file within a ZIP buffer entirely in memory.
 * * @param {Buffer} zipBuffer - The input ZIP file content as a Buffer.
 * @param {string} fileNameToModify - The path to the file inside the ZIP (e.g., 'data/report.txt').
 * @param {string} newContent - The new content to replace the file's current content.
 * @returns {Promise<Buffer>} A Promise that resolves with the modified ZIP file as a Buffer.
 */
export const modifyFileInZipBuffer = async (zipBuffer: Buffer, fileNameToModify: string, newDescription: string): Promise<Buffer> => {
  console.log('Starting in-memory ZIP modification...');

  // 1. Load the ZIP data from the input Buffer
  const zip = await JSZip.loadAsync(zipBuffer);

  // 2. Check and modify the file content
  const xmlFileEntry = zip.file(fileNameToModify);

  if (xmlFileEntry) {
    console.log(`Modifying file: ${fileNameToModify}`);

    const xmlContent = await xmlFileEntry.async('string');

    let xmlObj = parser.parse(xmlContent.toString());

    if (xmlObj.APIProxy) {
      xmlObj.APIProxy.Description = newDescription;
    } else if (xmlObj.SharedFlowBundle) {
      xmlObj.SharedFlowBundle.Description = newDescription;
    }

    const newXmlContent = builder.build(xmlObj);

    // Overwrite the file content in the in-memory ZIP object
    // The second argument can be a string, Buffer, or Stream
    zip.file(fileNameToModify, newXmlContent);

    console.log('Modification complete.');
  } else {
    console.warn(`File not found in zip: ${fileNameToModify}. Skipping modification.`);
    // You might decide to throw an error or create the file instead
  }

  // 3. Generate the new ZIP file buffer
  console.log('Generating new ZIP archive buffer...');
  const outputBuffer = await zip.generateAsync({
    type: 'nodebuffer', // Crucial for getting a Buffer back
    compression: 'DEFLATE',
    platform: 'UNIX'
  });

  console.log('Finished generating modified ZIP buffer.');
  return outputBuffer;
}

export const log = (...args: string[]) => {
  console.log(...args);
}

module.exports = { modifyFileInZipBuffer, log };