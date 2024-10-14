const app = require("../server/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const data = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("Invalid Enpoints Error", () => {
    test("404 - any requests to an invalid endpoint responds with a 404 not found", () => {
        return request(app)
        .get("/api/not-an-endpoint")
        .expect(404)
        .then(({body}) => {
            expect(body.msg).toBe("Route Not Found")
        })
    })
})