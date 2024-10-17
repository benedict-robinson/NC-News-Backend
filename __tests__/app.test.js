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
    describe("GET /api/topics", () => {
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
    describe("POST /api/topics", () => {
        test("POST: 201 - responds with object of new topic", () => {
            const newTopic = { "slug": 'Dutch Cheese', 
                "description": "What's gouda-nuff for them, is gouda-nuff for us" }
            return request(app).post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({body}) => {
                expect(body.topic).toEqual(newTopic)
            })
        })
        test("POST: 201 - adds the topic to the topic table", () => {
            const newTopic = { "slug": "Dutch Cheese", 
                "description": "What's gouda-nuff for them, is gouda-nuff for us" }
            return request(app).post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(() => {
                return db.query(`SELECT * FROM topics WHERE slug = 'Dutch Cheese';`)
                .then(({rows}) => {
                    expect(rows[0]).toEqual(newTopic)
                })
            })
        })
        test("POST: 201 - should ignore unnecessary send properties", () => {
            const newTopic = { "slug": "Dutch Cheese", 
                "description": "What's gouda-nuff for them, is gouda-nuff for us",
                "useless-key": "useless info" }
            const expectedTopic = { "slug": "Dutch Cheese", 
                "description": "What's gouda-nuff for them, is gouda-nuff for us" }
            return request(app).post(`/api/topics`)
            .send(newTopic)
            .expect(201)
            .then(({body}) => {
                expect(body.topic).toEqual(expectedTopic)
            })
        })
        test("POST: 201 - successfully makes post without description key as not required", () => {
            const newTopic = { slug: "Dutch Cheese"}
            return request(app).post("/api/topics")
            .send(newTopic)
            .expect(201)
            .then(({body}) => {
                expect(body.topic).toEqual({
                    slug: "Dutch Cheese",
                    description: null
                })
            })
        })
        test("POST: 400 - responds with 400 Bad Request when topic posted without required slug property", () => {
            const newTopic = { "description": "What's gouda-nuff for them, is gouda-nuff for us" }
            return request(app).post("/api/topics")
            .send(newTopic)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
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
                expect(body.articles).toBeSorted({key: "created_at", descending: true})
            })
        })
        describe("GET articles - queries", () => {
            test("Sort By - articles can be sorted by topic", () => {
                return request(app).get("/api/articles?sort_by=topic")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "topic"})
                })
            })
            test("Sort By - articles can be sorted by author", () => {
                return request(app).get("/api/articles?sort_by=author")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "author"})
                })
            })
            test("Sort By - articles can be sorted by title", () => {
                return request(app).get("/api/articles?sort_by=title")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "title"})
                })
            })
            test("Order - articles can be ordered by DESC if specified (ASC is default) when queries chained", () => {
                return request(app).get("/api/articles?sort_by=title&order=desc")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "title", descending: true})
                })
            })
            test("Order - articles can be ordered by ASC when applied to created_at as default is DESC", () => {
                return request(app).get("/api/articles?order=asc")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "created_at" })
                })
            })
            test("Order - default order for votes is DESC", () => {
                return request(app).get("/api/articles?sort_by=votes")
                .expect(200)
                .then(({body}) => {
                    const articles = body.articles
                    expect(articles.length).toBe(13)
                    expect(articles).toBeSorted({key: "votes", descending: true})
                })
            })
            test("GET: 400 - responds with 400 Bad Request when a query is given that is invalid", () => {
                return request(app).get("/api/articles?not-a-query=title")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("GET: 400 - responds with 400 Bad Request when a query is given that is not accepted (order)", () => {
                return request(app).get("/api/articles?order=not-a-query")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("GET: 400 - responds with 400 Bad Request when a query is given that is not accepted (sort_by)", () => {
                return request(app).get("/api/articles?sort_by=not-a-query")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("Topic - responds with articles filtered by topic when valid topic query given", () => {
                return request(app).get("/api/articles?topic=mitch")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(12)
                    body.articles.forEach(article => {
                        expect(article.topic).toBe("mitch")
                    })
                })
            })
            test("Topic - responds with all articles when valid topic given with no value", () => {
                return request(app).get("/api/articles?topic")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(13)
                })
            })
            test("Topic - responds with 200 but no content when given a valid & existing topic query but with not matching articles", () => {
                return request(app).get("/api/articles?topic=paper")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(0)
                })
            })
            test("GET: 400 - responds with 400 Bad Request when given an invalid topic query", () => {
                return request(app).get("/api/articles?topic=4")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("GET: 404 - responds with 404 Not Found when given a valid but non-existent topic query", () => {
                return request(app).get("/api/articles?topic=dutch_cheese")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Not Found")
                })
            })
            test("Author - responds with articles filtered by author when valid author query given", () => {
                return request(app).get("/api/articles?author=butter_bridge")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(4)
                    body.articles.forEach(article => {
                        expect(article.author).toBe("butter_bridge")
                    })
                })
            })
            test("Author - responds with all articles when author query given with no value", () => {
                return request(app).get("/api/articles?author")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(13)
                })
            })
            test("Author - responds with 200 but no content when given a valid & existing topic query but with not matching articles", () => {
                return request(app).get("/api/articles?author=lurker")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(0)
                })
            })
            test("GET: 400 - responds with 400 Bad Request when given an invalid author query value", () => {
                return request(app).get("/api/articles?author=4")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("GET: 404 - responds with 404 Not Found when given a valid but non-existent topic query", () => {
                return request(app).get("/api/articles?author=dutch_cheese")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Not Found")
                })
            })
            test("GET: 200 - topic & author queries can be chained", () => {
                return request(app).get("/api/articles?author=rogersop&topic=mitch")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(2)
                    body.articles.forEach(article => {
                        expect(article.topic).toBe("mitch")
                        expect(article.author).toBe("rogersop")
                    })
                })
            })
            test("GET: 200 - all queries can be chained", () => {
                return request(app).get("/api/articles?author=rogersop&topic=mitch&sort_by=title&order=desc")
                .expect(200)
                .then(({body}) => {
                    expect(body.articles).toHaveLength(2)
                    body.articles.forEach(article => {
                        expect(article.topic).toBe("mitch")
                        expect(article.author).toBe("rogersop")
                    })
                    expect(body.articles).toBeSorted({key: "title", descending: true})
                })
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
        describe("GET articles by id - queries", () => {
            test("Comment Count - responds get: 200 and lists the total number of comments on the selected article", () => {
                return request(app).get("/api/articles/6?comment_count")
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
                        comment_count: 1
                      }
                    expect(body.article).toEqual(articleSix)
                })
            })
        })
        describe("DELETE articles by id", () => {
            test("DELETE: 204 - responds with 204 message and no content when successfully deleted", () => {
                return request(app).delete("/api/articles/5")
                .expect(204)
            })
            test("DELETE: 204 - removes selected article from article table", () => {
                const id = 5
                return request(app).delete(`/api/articles/${id}`)
                .expect(204)
                .then(() => {
                    return db.query(`SELECT article_id FROM articles;`)
                    .then(({rows}) => {
                        const articleIds = rows.map(article => article.article_id)
                        expect(articleIds.includes(id)).toBe(false)
                    })
                })
            })
            test("DELETE: 400 - responds with 400 Bad Request when given an invalid id", () => {
                return request(app).delete("/api/articles/not-an-id")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("DELETE: 404 - responds with 404 Not Found when given an non-existent id", () => {
                return request(app).delete("/api/articles/9999")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("Not Found")
                })
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
                expect(body.comments).toBeSorted({key: 'created_at',descending: true})
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
                expect(body.comment).toEqual({
                    comment_id: expect.any(Number),
                    body: "Is this the same Mitch that runs the seminars?",
                    author: "rogersop",
                    created_at: expect.any(String),
                    votes: expect.any(Number),
                    article_id: 4
                })
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
        test("POST: 201 - should ignore unnecessary send properties", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "rogersop",
                uselessKey: "not important at all"
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
        test("POST: 404 Username Does Not Exist - responds with 404 when user property does not exist in user table", () => {
            const comment = {
                body: "Is this the same Mitch that runs the seminars?",
                author: "brigadierBenedict",
            }
            return request(app).post(`/api/articles/3/comments`)
            .send(comment)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("User Not Found")
            })
        })
    })
    describe("DELETE: 204 - responds with 204 message and no content when successfully deleted", () => {
        test("DELETE: 204 - responds with 204 message and no content when successfully deleted", () => {
            return request(app).delete("/api/comments/5")
            .expect(204)
        })
        test("DELETE: 204 - removes selected comment from comment table", () => {
            const id = 5
            return request(app).delete(`/api/comments/${id}`)
            .expect(204)
            .then(() => {
                return db.query(`SELECT comment_id FROM comments;`)
                .then(({rows}) => {
                    const commentIds = rows.map(comment => comment.comment_id)
                    expect(commentIds.includes(id)).toBe(false)
                })
            })
        })
        test("DELETE: 400 - responds with 400 Bad Request when given an invalid id", () => {
            return request(app).delete("/api/comments/not-an-id")
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
        test("DELETE: 404 - responds with 404 Not Found when given an non-existent id", () => {
            return request(app).delete("/api/comments/9999")
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Not Found")
            })
        })
    })

})

describe("Votes", () => {
    describe("PATCH - articles/:article_id", () => {
        test("PATCH: 200 - responds with updated article", () => {
            const voteIncrease = { inc_vote: 17 }
            return request(app).patch("/api/articles/4")
            .send(voteIncrease)
            .expect(200)
            .then(({body}) => {
                const article = body.article
                expect(article).toEqual({
                    article_id: 4,
                    author: expect.any(String),
                    title: expect.any(String),
                    topic: expect.any(String),
                    votes: expect.any(Number),
                    body: expect.any(String),
                    created_at: expect.any(String),
                    article_img_url: expect.any(String)
                })
            })
        })
        test("PATCH: 200 - responds with an updated article with votes increased by send request", () => {
            const voteIncrease = { inc_vote: 17 }
            return request(app).patch("/api/articles/4")
            .send(voteIncrease)
            .expect(200)
            .then(({body}) => {
                expect(body.article.votes).toBe(17)
            })
        })
        test("PATCH: 200 - responds with an updated article with votes decreased by send request if negative", () => {
            const voteIncrease = { inc_vote: -20 }
            return request(app).patch("/api/articles/1")
            .send(voteIncrease)
            .expect(200)
            .then(({body}) => {
                expect(body.article.votes).toBe(80)
            })
        })
        test("PATCH: 200 - responds with 0 votes when the vote decrease takes total into negatives", () => {
            const voteIncrease = { inc_vote: -120 }
            return request(app).patch("/api/articles/1")
            .send(voteIncrease)
            .expect(200)
            .then(({body}) => {
                expect(body.article.votes).toBe(0)
            })
        })
        test("PATCH: 200 - ignores unnecessary send properties and responds with an updated article", () => {
            const voteIncrease = { inc_vote: 17, not_a_key: "nothing important" }
            return request(app).patch("/api/articles/4")
            .send(voteIncrease)
            .expect(200)
            .then(({body}) => {
                expect(body.article.votes).toBe(17)
            })
        })
    })
    describe("PATCH - articles/:article_id - Errors", () => {
        test("PATCH: 400 - responds with 400 Bad Request if endpoint contains invalid id type", () => {
            const voteIncrease = { inc_vote: 120 }
            return request(app).patch("/api/articles/not-an-id")
            .send(voteIncrease)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
        test("PATCH: 404 - responds with 404 Not Found if endpoint contains non-existent id", () => {
            const voteIncrease = { inc_vote: 120 }
            return request(app).patch("/api/articles/9999")
            .send(voteIncrease)
            .expect(404)
            .then(({body}) => {
                expect(body.msg).toBe("Not Found")
            })
        })
        test("PATCH: 400 - responds with Bad Request when attempting to patch votes without inc_vote key", () => {
            const badPatchRequest = { nothing_here: "nada importante" }
            return request(app).patch("/api/articles/6")
            .send(badPatchRequest)
            .expect(400)
            .then(({body}) => {
                expect(body.msg).toBe("Bad Request")
            })
        })
    })
})

describe("Users", () => {
    describe("GET Users", () => {
        test("GET: 200 - responds with an array of all users", () => {
            return request(app).get("/api/users")
            .expect(200)
            .then(({body}) => {
                expect(body.users).toHaveLength(4)
            })
        })
        test("GET: 200 - the array of users has the required property keys with correct value types", () => {
            return request(app).get("/api/users")
            .expect(200)
            .then(({body}) => {
                const users = body.users
                users.forEach(user => {
                    expect(typeof user.username).toBe("string")
                    expect(typeof user.name).toBe("string")
                    expect(typeof user.avatar_url).toBe("string")
                })
            })
        })
        test("GET: 200 - the user array is ordered by username ascending", () => {
            return request(app).get("/api/users")
            .expect(200)
            .then(({body}) => {
                expect(body.users).toBeSorted({key: 'username',descending: false})
            })
        })
        describe("Get Users - Queries", () => {
            test("GET: 200 - responds with a single user with a username that matches the query", () => {
                return request(app).get("/api/users?username=lurker")
                .expect(200)
                .then(({body}) => {
                    expect(body.user).toEqual({
                        username: 'lurker',
                        name: 'do_nothing',
                        avatar_url:
                          'https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png'
                      })
                })
            })
            test("GET: 400 - responds with a Bad Request if username given is an invalid type, ie: a number", () => {
                return request(app).get("/api/users?username=17")
                .expect(400)
                .then(({body}) => {
                    expect(body.msg).toBe("Bad Request")
                })
            })
            test("GET: 404 - responds with a User Not Found if username given is valid but doesn't exist", () => {
                return request(app).get("/api/users?username=brigadier_benno")
                .expect(404)
                .then(({body}) => {
                    expect(body.msg).toBe("User Not Found")
                })
            })
        })
    })
})