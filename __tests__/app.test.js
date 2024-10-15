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
    describe("/api/articles", () => {
        test("GET: 200 - responds with an array of all articles", () => {
            return request(app).get("/api/articles")
            .expect(200)
            .then(({body}) => {
                expect(body.articles.length).toBe(13)
            })
        })
        test("GET: 200 - responds with an array of object with correct property keys", () => {
            return request(app).get("/api/articles")
            .expect(200)
            .then(({body}) => {
                const articles = body.articles
                const keys = ["article_id", "title", "author", "topic", "created_at", "votes", "article_img_url", "comment_count"]
                articles.forEach(article => {
                    expect(Object.keys(article)).toEqual(keys)
                    expect(typeof article.article_id).toBe("number")
                    expect(typeof article.author).toBe("string")
                    expect(typeof article.title).toBe("string")
                    expect(typeof article.topic).toBe("string")
                    expect(typeof article.votes).toBe("number")
                    expect(typeof article.comment_count).toBe("number")
                })
            })
        })
        test("GET: 200 - responds with articles in descending date order", () => {
            return request(app).get("/api/articles")
            .expect(200)
            .then(({body}) => {
                const articles = body.articles
                const regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/
                const dates = articles.map(article => {
                    const objDate = article.created_at
                    const dateStrHyphens = objDate.match(regex)[0]
                    const dateStr = `${dateStrHyphens.slice(0, 4)}${dateStrHyphens.slice(5, 7)}${dateStrHyphens.slice(8, 10)}`
                    return Number(dateStr)
                })
                const datesPreSort = [...dates]
                const datesSortedDesc = datesPreSort.sort((a, b) => b - a)
                
                expect(dates).toEqual(datesSortedDesc)
            })
        })
    })
    describe("/api/articles/:article_id", () => {
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