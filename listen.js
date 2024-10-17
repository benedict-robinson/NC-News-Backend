const app = require("./app.js");
const { PORT = 1789 } = process.env;

app.listen(PORT, () => console.log(`Listening on ${PORT}...`));