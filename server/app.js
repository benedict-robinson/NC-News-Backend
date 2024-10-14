const express = require("express")
const app = express()





app.use("/*", (req, res) => {
    res.status(404).send({msg: "Route Not Found"})
})




module.exports = app