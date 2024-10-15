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
    checkIfOrderedMostRecent
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
    describe("/api/topics", () => {
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
        test("GET: 200 - topics are sorted by slug ASC", () => {
            return request(app).get("/api/topics")
            .expect(200)
            .then(({body}) => {
                const topics = body.topics
                const topicsFirstLetter = topics.map(topic => {
                    return topic.slug[0]
                })
                const alphabet = "abcdefghijklmnopqrstuvwxyz"
                const lettersIndex = topicsFirstLetter.map(letter => {
                    return alphabet.search(letter)
                })
                const lettersPreSort = [...lettersIndex]
                expect(lettersIndex).toEqual(lettersPreSort.sort((a, b) => a - b))
                expect(lettersIndex.reverse()).toEqual(lettersPreSort.sort((a, b) => b - a))
                
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
                const articlesDate = body.articles.map(article => {
                    return article.created_at
                })
                const testOfOrder = checkIfOrderedMostRecent(articlesDate)
                expect(testOfOrder).toBe(true)
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
    describe("/api/articles/:article_id/comments", () => {
        test("GET: 200 - returns an array of all comments for specified article", () => {
            return request(app).get("/api/articles/1/comments")
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toHaveLength(11)
            })
        })
        test("GET: 200 - returns an array of comment objects with correct keys with correct data types", () => {
            return request(app).get("/api/articles/1/comments")
            .expect(200)
            .then(({body}) => {
                const comments = body.comments
                const keys = ["comment_id", "votes", "created_at", "author", "body", "article_id"]
                comments.forEach(comment => {
                    expect(Object.keys(comment)).toEqual(keys)
                    expect(typeof comment.comment_id).toBe("number")
                    expect(typeof comment.author).toBe("string")
                    expect(typeof comment.body).toBe("string")
                    expect(typeof comment.article_id).toBe("number")
                    expect(typeof comment.votes).toBe("number")
                })
            })
        })
        test("GET: 200 - comments array are ordered by most recent", () => {
            return request(app).get("/api/articles/1/comments")
            .expect(200)
            .then(({body}) => {
                const commentsDates = body.comments.map(comment => {
                    return comment.created_at
                })
                expect(checkIfOrderedMostRecent(commentsDates)).toBe(true)
            })
        })
    })
    describe("/api/articles/:article_id/comments - ERRORS", () => {
        test("GET: 400 - returns Bad Request Error when id is not a valid id type", () => {
            return request(app).get("/api/articles/not-an-id/comments")
            .expect(400)
            .then(({body}) => {
               expect(body.msg).toBe('Bad Request') 
            })
        })
        test("GET: 404 - returns Not Found when id doesn't exist", () => {
            return request(app).get("/api/articles/9999/comments")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Article Not Found")
            })
        })
        test("GET: 200 - returns empty array with message, ,no comments yet' when passed valid id but no comments attached", () => {
            return request(app).get("/api/articles/2/comments")
            .expect(200)
            .then(({body}) => {
                expect(body.comments).toHaveLength(0)
                expect(body.msg).toBe("No Comments Yet")
            })
        })
    })
})

describe("Comments - POST/PATCH/DELETE", () => {
    describe("POST", () => {
        test("POST: 201 - should return the posted comment", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "rogersop",
            }
            return request(app).post(`/api/articles/4/comments`)
            .send(comment)
            .expect(201)
            .then(({body}) => {
               const objKeys  = ["comment_id", "body", "article_id", "author", "votes", "created_at"]
                expect(Object.keys(body.comment)).toEqual(objKeys)
            })
        })
        test("POST: 201 - should add comment to comment table", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "rogersop",
            }
            return request(app).post(`/api/articles/4/comments`)
            .send(comment)
            .expect(201)
            .then(({body}) => {
                return db.query(`SELECT * FROM comments ORDER BY created_at DESC;`)
                .then(({rows}) => {
                    expect(rows).toHaveLength(19)
                    expect(rows[0].body).toBe("Is this the same Mitch that runs the seminars?")
                })
            })
        })
        test("POST: 400 - returns Error 400 Bad Request and endpoint contains invalid article id", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "rogersop",
            }
            return request(app).post(`/api/articles/not-an-id/comments`)
            .send(comment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
        test("POST: 404 - returns Error 404 Not Found when article id does not exist", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "rogersop",
            }
            return request(app).post(`/api/articles/9999/comments`)
            .send(comment)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Not Found")
            })
        })
        test("POST: 400 - responds with 400 error when attempting to comment without required porperties (body)", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?"
            }
            return request(app).post(`/api/articles/4/comments`)
            .send(comment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
        test("POST: 400 - responds with 400 error when attempting to comment without required porperties (author)", () => {
            const comment = {
                author: 'rogersop'
            }
            return request(app).post(`/api/articles/4/comments`)
            .send(comment)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
    })
})

/*
 errors
 - invalid id type: ie string
 - article id doesnt exist
 - article id exists but no comments
 */