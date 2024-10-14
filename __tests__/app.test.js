const app = require("../server/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const data = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const expectedEndpoints = require("../endpoints.json")

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

describe("Topics", () => {
    describe("GET", () => {
        test("GET: 200 - should respond with an array of all topics", () => {
            return request(app).get("/api/topics")
            .expect(200)
            .then(({body}) => {
                const topics = body.topics
                expect(Array.isArray(topics))
                expect(topics.length).toBe(3)
            })
        })
        test("GET: 200 - each topic should have a key of 'description' and 'slug'", () => {
            return request(app).get("/api/topics")
            .expect(200)
            .then(({body}) => {
                const topics = body.topics
                topics.forEach(topic => {
                    expect(Object.keys(topic)).toEqual([ "slug", "description"])
                })
            })
        })
    })
})

describe("/api", () => {
    test("GET: 200 - returns an object of all other endpoints as nested object", () => {
        return request(app).get("/api")
        .expect(200)
        .then(({body}) => {
            const receivedEndpoints = body.endpoints
            expect(receivedEndpoints).toEqual(expectedEndpoints)
        })
    })
})