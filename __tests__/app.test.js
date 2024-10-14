const app = require("../server/app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const data = require("../db/data/test-data/index.js");
const seed = require("../db/seeds/seed.js");
const expectedEndpoints = require("../endpoints.json")
const {
    convertTimestampToDate,
    createRef,
    formatComments,
  } = require('../db/seeds/utils.js');

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

describe("Articles", () => {
    describe.only("Articles By Id", () => {
        test("GET: 200 - articles by valid Id returns the article with that ID", () => {
            return request(app).get("/api/articles/6")
            .expect(200)
            .then(({body}) => {
                const articleSix = {
                    article_id: 6,
                    title: "A",
                    topic: "mitch",
                    author: "icellusedkars",
                    body: "Delicious tin of cat food",
                    created_at: "2020-10-18 02:00:00",
                    votes: 0,
                    article_img_url:
                      "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
                  }
                  expect(body.article).toEqual(articleSix)
            })
        })
        test("GET: 400 - returns an error 400 Bad Request if the endpoint does not contain a valid id data type", () => {
            return request(app).get("/api/articles/not-an-id")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toEqual("Bad Request")
            })
        })
        test("GET: 404 - returns an error 404 Not Found if the endpoint contains an id that does not exist", () => {
            return request(app).get("/api/articles/60000")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toEqual("Article Not Found")
            })
        })
    })
})