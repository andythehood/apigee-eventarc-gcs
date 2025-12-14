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
import { GoogleAuth } from "google-auth-library";
import axios from "axios";

export const  downloadRevision = async(org:string, type: string, name: string, revision:string): Promise<Buffer> =>{

  const o =  encodeURIComponent(org);
  const t =  encodeURIComponent(type);
  const n =  encodeURIComponent(name);
  const r =  encodeURIComponent(revision);

  // const url = `https://apigee.googleapis.com/v1/organizations/${org}/${type}/${name}/revisions/${revision}?format=bundle`;
  const url = `https://apigee.googleapis.com/v1/organizations/${o}/${t}/${n}/revisions/${r}?format=bundle`;

  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const res = await axios.get(url, {
    responseType: "arraybuffer",
    headers: { Authorization: `Bearer ${token.token}` }
  });

  return Buffer.from(res.data);
}
