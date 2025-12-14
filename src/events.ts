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
import { downloadRevision } from "./apigee";
import { saveZip, saveMetadata, archive } from "./storage";
import { log, modifyFileInZipBuffer } from "./utils";

export const handleEvent = async (event: any) => {
  const payload = event?.protoPayload;
  if (!payload) throw new Error("Invalid event payload");

  const method = payload.methodName;
  const resource = payload.resourceName;
  const response = payload.response;
  const timestamp = event.receiveTimestamp;
  const authenticatedUser = payload.authenticationInfo?.principalEmail || "unknown";

  log(`Event: ${method}`);
  log(`Resource: ${resource}`);
  log(`Response: ${JSON.stringify(response, null, 2)}`);

  if (!resource.startsWith(`organizations/${process.env.APIGEE_ORG}`)) {
    log(`Invalid Organization`);
    return;
  }

  // -----------------------------
  // 1. REVISION CREATED 
  // -----------------------------
  if (method === "google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision" ||
    method === "google.cloud.apigee.v1.SharedFlowService.CreateSharedFlowRevision"
  ) {

    // organizations/fpg-dev
    const resourceParts = resource.split("/");
    const org = resourceParts[1];
    const type = method === "google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision" ? "apis" : "sharedflows"

    const name = response.name
    const revision = response.revision

    log(`Revision created: ${name} rev=${revision}`);

    const zipBuffer = await downloadRevision(org, type, name, revision);
    const filename = type === "apis" ? `apiproxy/${name}.xml` : `sharedflowbundle/${name}.xml`
    const newDescription = `SOURCE: org=${process.env.APIGEE_ORG} name=${name} rev=${revision} date=${timestamp}`;

    const modifiedZip = await modifyFileInZipBuffer(zipBuffer,filename,newDescription)
    await saveZip(type, name, revision, modifiedZip);

    return saveMetadata(type, name, revision, {
      type,
      name,
      revision,
      authenticatedUser,
      last_updated_at: timestamp
    });
  }

  // -----------------------------
  // 2. REVISION UPDATED
  // -----------------------------
  if (method === "google.cloud.apigee.v1.ApiProxyService.UpdateApiProxyRevision" ||
    method === "google.cloud.apigee.v1.SharedFlowService.UpdateSharedFlowRevision"
  ) {

    // organizations/fpg-dev/apis/weather-api/revisions/18
    const resourceParts = resource.split("/");
    const org = resourceParts[1];
    const type = resourceParts[2];
    const name = resourceParts[3];
    const revision = resourceParts[5];

    log(`Revision updated: ${name} rev=${revision}`);

    const zipBuffer = await downloadRevision(org, type, name, revision);
    await saveZip(type, name, revision, zipBuffer);

    return saveMetadata(type, name, revision, {
      type,
      name,
      revision,
      authenticatedUser,
      last_updated_at: timestamp
    });
  }

  // -----------------------------
  // 3. REVISION DELETED
  // -----------------------------
  if (method === "google.cloud.apigee.v1.ApiProxyService.DeleteApiProxyRevision" ||
    method === "google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlowRevision"
  ) {
    const resourceParts = resource.split("/");
    const type = resourceParts[2];
    const name = resourceParts[3];
    const revision = resourceParts[5];

    log(`Revision deleted: ${name} rev=${revision}`);

    return saveMetadata(type, name, revision, {
      type,
      name,
      revision,
      authenticatedUser,
      state: "deleted",
      deleted_at: timestamp
    }, true);
  }

  // -----------------------------
  // 4. PROXY/SHAREDFLOW DELETED
  // -----------------------------
  if (method === "google.cloud.apigee.v1.ApiProxyService.DeleteApiProxy" ||
    method === "google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlow"
  ) {
    // Parse: organizations/org/apis/proxy/revisions/7
    const resourceParts = resource.split("/");
    const type = resourceParts[2];
    const name = resourceParts[3];

    log(`Proxy/Sharedflow deleted: ${name}`);
    return archive(type, name);
  }

  log("Ignored event", method);
}
