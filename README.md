# Apigee Eventarc for GCS

[![Apache 2.0](https://img.shields.io/badge/license-apache%202.0-blue.svg)](LICENSE)
![LastCommit](https://img.shields.io/github/last-commit/andythehood/apigee-eventarc-gcs/main.svg)
![CommitActivity](https://img.shields.io/github/commit-activity/4w/andythehood/apigee-eventarc-gcs) 


Apigee Eventarc for GCS enables updates to Apigee API Proxies and Sharedflows to be automatically exported and saved to a Google Cloud Storage (GCS) bucket.

It is intended for use by Apigee Developers who have not yet fully adopted a Git based 'Proxy as Code' strategy and who still enable changes to API Proxy and Sharedflow configurations via the Apigee Console. 

When a new revision of a API Proxy or Sharedflow is created or an existing revision updated or deleted, an [Eventarc](https://docs.cloud.google.com/eventarc/docs) event is automatically generated. This repo contains the code for the Cloud Run service that is invoked by Eventarc when a create/update/delete event occurs.

The Cloud Run service exports the API Proxy/Sharedflow bundle from the Apigee Organisation and saves it to a specified GCS bucket. This provides an immutable record of every new or modified revision.


## Events

The following events are handled:

| Eventarc Event                                                          | Description                                       |
| ----------------------------------------------------------------------- | ------------------------------------------------- |
| google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision           | Create new API Proxy Revision                     |
| google.cloud.apigee.v1.ApiProxyService.UpdateApiProxyRevision           | Update API Proxy Revision                         |
| google.cloud.apigee.v1.ApiProxyService.DeleteApiProxyRevision           | Delete API Proxy Revision                         |
| google.cloud.apigee.v1.ApiProxyService.DeleteApiProxy                   | Delete API Proxy                                  |
| google.cloud.apigee.v1.SharedFlowService.CreateSharedFlowRevision.      | Create new Sharedflow Revision                    |
| google.cloud.apigee.v1.SharedFlowService.UpdateSharedFlowRevision       | Update Sharedflow Revision                        |
| google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlowRevision       | Delete SharedFlow Revision                        |
| google.cloud.apigee.v1.SharedFlowService.DeleteSharedFlow               | Delete SharedFlow                                 |

## Requirements

### Environment Variables
The Cloud Run service needs the following Environment Variables to be set:

`APIGEE_ORG` - the name of the Apigee Organisation whose events will be processed. If Eventarc events are received from a different Apigee Organisation, they will be ignored

`BUCKET` - the name of the GCS Bucket where the exported API Proxy and Sharedflow bundles will be written. 

### Service Account

A Service Account should be created to run the Cloud Run service. This Service Account requires the following permissions:

* Cloud Run Invoker         `roles/run.invoker`
* Eventarc Event Receiver   `roles/eventarc.eventReceiver`
* Apigee API Reader         `roles/apigee.apiReaderV2`
* Storage Admin             `roles/storage.admin`



## Usage

### Cloud Run Service

To use, build and deploy the Cloud Run service. A Dockerfile is provided to build the container image. 

Example gcloud commands are as below:


```
gcloud builds submit \
  --project $PROJECT_ID \
  --tag us-central1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC
```

```
gcloud run deploy $CLOUD_RUN_SVC \
  --project $PROJECT_ID \
  --image us-central1-docker.pkg.dev/$PROJECT_ID/docker/$CLOUD_RUN_SVC \
  --region $REGION \
  --platform managed \
  --service-account $SA_EMAIL \
  --set-env-vars "APIGEE_ORG=$APIGEE_ORG,BUCKET=$BUCKET" \
  --ingress internal-and-cloud-load-balancing \
  --no-allow-unauthenticated
```

### Create Eventarc Triggers

Eventarc Triggers must be created for each of the Events listed above.

Sample gcloud command is as below:

```
EVENT_FILTER_TYPE="type=google.cloud.audit.log.v1.written"
EVENT_FILTER_SERVICE="serviceName=apigee.googleapis.com"

gcloud eventarc triggers create apigee-proxy-revision-update \
  --project $PROJECT_ID \
  --location global \
  --destination-run-service $CLOUD_RUN_SVC \
  --destination-run-region $REGION \
  --event-filters $EVENT_FILTER_TYPE \
  --event-filters $EVENT_FILTER_SERVICE \
  --event-filters "methodName=google.cloud.apigee.v1.ApiProxyService.UpdateApiProxyRevision" \
  --service-account $SA_EMAIL  
```

**Note**, the location attribute in the above command needs to correspond with the Control Plane location of the Apigee Organisation.
Unless you have configured [Data Residency](https://docs.cloud.google.com/apigee/docs/api-platform/get-started/drz-concepts), then the required value is `global`

<!-- If you are using VScode, then you can also use these plugins with the [Apigeelint 4 VS Code](https://marketplace.visualstudio.com/items?itemName=andythehood.apigeelint4vscode) extension by selecting the following extension setting:

- `apigeelint.externalPluginsDirectory`: Full path to an external plugins directory (default: none) -->

## Known Issues

None

## Limitations

None

## Support

If you find issues, file a ticket here on Github. Keep in mind that there is no
service level agreement (SLA) for responses to these issues. Assume all
responses are on an ad-hoc, volunteer basis.

<!-- If you simply have questions, we recommend asking on the [Apigee
forum](https://www.googlecloudcommunity.com/gc/Apigee/bd-p/cloud-apigee/) on
GoogleCloudCommunity. Apigee experts regularly check that forum. -->

Apigee customers should use [formal Google support channels](https://cloud.google.com/apigee/support) for Apigee product related concerns.

## License and Copyright

This material is [Copyright (c) 2025 Aviato Consulting](./NOTICE).
and is licensed under the [Apache 2.0 License](LICENSE).

## Disclaimer

These plugins do not form part of Apigee or any other officially supported Google Product.
