# Copyright 2025 Aviato Consulting

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     https://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# Enable APIS

gcloud services enable \
  --project $PROJECT_ID \
  apigee.googleapis.com \
  eventarc.googleapis.com \
  secretmanager.googleapis.com \
  run.googleapis.com \
  cloudbuild.googleapis.com

# Secret Manager
# Create Secrets

gcloud secrets create github-app-private-key \
  --project $PROJECT_ID \
  --replication-policy="automatic" \
  --data-file apigee-event-exporter.2025-10-12.private-key.pem

# gcloud secrets versions add github-app-private-key \
#   --project $PROJECT_ID \
#   --data-file apigee-event-exporter.2025-10-12.private-key.pem

gcloud iam service-accounts create $SERVICE_ACCOUNT \
  --project $PROJECT_ID \
  --display-name="Apigee Event Exporter" \
  --description="Apigee Event Exporter"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/apigee.orgAdmin"    

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/eventarc.eventReceiver"    

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/eventarc.eventReceiver"    

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/eventarc.eventReceiver"    

gcloud builds submit \
  --project $PROJECT_ID \
  --tag australia-southeast1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC

gcloud run deploy $CLOUD_RUN_SVC \
  --project $PROJECT_ID \
  --image australia-southeast1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC \
  --region $REGION \
  --platform managed \
  --service-account $SA_EMAIL \
  --set-env-vars "PROJECT_ID=$PROJECT_ID,BUCKET=$BUCKET" \
  --ingress internal-and-cloud-load-balancing \
  --no-allow-unauthenticated


gcloud builds submit \
  --project $PROJECT_ID \
  --tag australia-southeast1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC
  
gcloud run deploy $CLOUD_RUN_SVC \
  --project $PROJECT_ID \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC \
  --region $REGION \
  --platform managed \
  --service-account $SA_EMAIL \
  --set-env-vars "PROJECT_ID=$PROJECT_ID,BUCKET=$BUCKET" \
  --ingress internal-and-cloud-load-balancing \
  --no-allow-unauthenticated


gcloud run services add-iam-policy-binding $CLOUD_RUN_SVC \
  --project $PROJECT_ID \
  --region $REGION \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/run.invoker"  

gcloud eventarc triggers create apigee-proxy-revision-update \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.ApiProxyService.UpdateApiProxyRevision" \
  --service-account=$SA_EMAIL    

gcloud eventarc triggers create apigee-proxy-revision-create \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision" \
  --service-account=$SA_EMAIL    

gcloud eventarc triggers create apigee-proxy-revision-delete \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.ApiProxyService.DeleteApiProxyRevision" \
  --service-account=$SA_EMAIL     

gcloud eventarc triggers create apigee-proxy-delete \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.ApiProxyService.DeleteApiProxy" \
  --service-account=$SA_EMAIL      

gcloud eventarc triggers create apigee-sharedflow-revision-update \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.SharedFlowService.UpdateSharedFlowRevision" \
  --service-account=$SA_EMAIL    

gcloud eventarc triggers create apigee-sharedflow-revision-create \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.SharedFlowService.CreateSharedFlowRevision" \
  --service-account=$SA_EMAIL     

gcloud eventarc triggers create apigee-sharedflow-revision-delete \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlowRevision" \
  --service-account=$SA_EMAIL     

gcloud eventarc triggers create apigee-sharedflow-delete \
  --project $PROJECT_ID \
  --location=global \
  --destination-run-service=$CLOUD_RUN_SVC \
  --destination-run-region=$REGION \
  --event-filters="type=google.cloud.audit.log.v1.written" \
  --event-filters="serviceName=apigee.googleapis.com" \
  --event-filters="methodName=google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlow" \
  --service-account=$SA_EMAIL      