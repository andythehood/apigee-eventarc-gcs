import request from "supertest";

// Mocks must be defined before imports/requires
const mockBucket = {
    file: jest.fn(),
};
const mockStorage = {
    bucket: jest.fn().mockReturnValue(mockBucket),
};

jest.mock("@google-cloud/storage", () => ({
    Storage: jest.fn().mockReturnValue(mockStorage)
}));

jest.mock("../src/events", () => ({
    handleEvent: jest.fn()
}));

// We need to delay importing index until after env vars are set
describe("POST /", () => {
    let app: any;
    let server: any;
    let handleEvent: any;

    beforeAll(() => {
        process.env.APIGEE_ORG = "test-org";
        process.env.BUCKET = "test-bucket";
        // Quiet logs
        jest.spyOn(console, 'log').mockImplementation(() => { });
        jest.spyOn(console, 'error').mockImplementation(() => { });

        const mod = require("../src/index");
        app = mod.app;
        server = mod.server;
        handleEvent = require("../src/events").handleEvent;
    });

    afterAll((done) => {
        server.close(done);
        jest.restoreAllMocks();
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should return 200 OK on success", async () => {
        (handleEvent as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app)
            .post("/")
            .send({ some: "event" });

        expect(response.status).toBe(200);
        expect(response.text).toBe("OK");
        expect(handleEvent).toHaveBeenCalledWith("test-org", mockBucket, { some: "event" });
    });

    it("should return 200 and error message on failure", async () => {
        (handleEvent as jest.Mock).mockRejectedValue(new Error("Something went wrong"));

        const response = await request(app)
            .post("/")
            .send({ some: "bean" });

        expect(response.status).toBe(200);
        expect(response.text).toBe("Something went wrong");
        expect(handleEvent).toHaveBeenCalled();
    });
});
