import { handleEvent } from "../src/events";
import * as apigee from "../src/apigee";
import * as storage from "../src/storage";
import * as utils from "../src/utils";

jest.mock("../src/apigee");
jest.mock("../src/storage");
jest.mock("../src/utils");

describe("handleEvent", () => {
    const mockBucket = {} as any;
    const org = "my-org";

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.APIGEE_ORG = org;
    });

    it("should ignore events from other organizations", async () => {
        const event = {
            protoPayload: {
                methodName: "google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision",
                resourceName: "organizations/other-org/apis/my-api/revisions/1",
                response: {
                    name: "my-api",
                    revision: "1"
                }
            }
        };

        await handleEvent(org, mockBucket, event);

        expect(utils.log).toHaveBeenCalledWith("Invalid Organization");
        expect(apigee.downloadRevision).not.toHaveBeenCalled();
    });

    it("should handle ApiProxyService.CreateApiProxyRevision", async () => {
        const event = {
            receiveTimestamp: "2023-10-27T10:00:00Z",
            protoPayload: {
                methodName: "google.cloud.apigee.v1.ApiProxyService.CreateApiProxyRevision",
                resourceName: `organizations/${org}/apis/my-api/revisions/1`,
                response: {
                    name: "my-api",
                    revision: "1"
                },
                authenticationInfo: {
                    principalEmail: "user@example.com"
                }
            }
        };

        const mockZipBuffer = Buffer.from("mock-zip");
        const mockModifiedZip = Buffer.from("modified-zip");
        (apigee.downloadRevision as jest.Mock).mockResolvedValue(mockZipBuffer);
        (utils.modifyFileInZipBuffer as jest.Mock).mockResolvedValue(mockModifiedZip);

        await handleEvent(org, mockBucket, event);

        expect(apigee.downloadRevision).toHaveBeenCalledWith(org, "apis", "my-api", "1");
        expect(utils.modifyFileInZipBuffer).toHaveBeenCalledWith(mockZipBuffer, "apiproxy/my-api.xml", expect.stringContaining("SOURCE:"));
        expect(storage.saveZip).toHaveBeenCalledWith(mockBucket, "apis", "my-api", "1", mockModifiedZip);
        expect(storage.saveMetadata).toHaveBeenCalledWith(mockBucket, "apis", "my-api", "1", {
            type: "apis",
            name: "my-api",
            revision: "1",
            authenticatedUser: "user@example.com",
            last_updated_at: "2023-10-27T10:00:00Z"
        });
    });

    it("should handle SharedFlowService.UpdateSharedFlowRevision", async () => {
        const event = {
            receiveTimestamp: "2023-10-27T10:00:00Z",
            protoPayload: {
                methodName: "google.cloud.apigee.v1.SharedFlowService.UpdateSharedFlowRevision",
                resourceName: `organizations/${org}/sharedflows/my-sf/revisions/2`,
                authenticationInfo: {
                    principalEmail: "user@example.com"
                }
            }
        };

        const mockZipBuffer = Buffer.from("mock-zip");
        (apigee.downloadRevision as jest.Mock).mockResolvedValue(mockZipBuffer);

        await handleEvent(org, mockBucket, event);

        expect(apigee.downloadRevision).toHaveBeenCalledWith(org, "sharedflows", "my-sf", "2");
        // Updates do NOT modify the zip
        expect(utils.modifyFileInZipBuffer).not.toHaveBeenCalled();
        expect(storage.saveZip).toHaveBeenCalledWith(mockBucket, "sharedflows", "my-sf", "2", mockZipBuffer);
        expect(storage.saveMetadata).toHaveBeenCalledWith(mockBucket, "sharedflows", "my-sf", "2", {
            type: "sharedflows",
            name: "my-sf",
            revision: "2",
            authenticatedUser: "user@example.com",
            last_updated_at: "2023-10-27T10:00:00Z"
        });
    });

    it("should handle ApiProxyService.DeleteApiProxyRevision", async () => {
        const event = {
            receiveTimestamp: "2023-10-27T10:00:00Z",
            protoPayload: {
                methodName: "google.cloud.apigee.v1.ApiProxyService.DeleteApiProxyRevision",
                resourceName: `organizations/${org}/apis/my-api/revisions/3`,
                authenticationInfo: {
                    principalEmail: "user@example.com"
                }
            }
        };

        await handleEvent(org, mockBucket, event);

        expect(storage.saveMetadata).toHaveBeenCalledWith(mockBucket, "apis", "my-api", "3", {
            type: "apis",
            name: "my-api",
            revision: "3",
            authenticatedUser: "user@example.com",
            state: "deleted",
            deleted_at: "2023-10-27T10:00:00Z"
        }, true);
    });

    it("should handle ApiProxyService.DeleteApiProxy", async () => {
        const event = {
            protoPayload: {
                methodName: "google.cloud.apigee.v1.ApiProxyService.DeleteApiProxy",
                resourceName: `organizations/${org}/apis/my-api`,
            }
        };

        await handleEvent(org, mockBucket, event);

        expect(storage.archive).toHaveBeenCalledWith(mockBucket, "apis", "my-api");
    });
});
