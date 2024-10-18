# Northcoders News API

**Hello, Welcome to the NC-News Backend API repository!** 

Created for the Northcoders Backend Review Project, this repository is a RESTful API that supplies the backend infrastructure for the managment of data in the NC News database and can handle core logic and database interactions. 

**Features**
RESTful API design for easy integration
Input validation and error handling
Modular Structure
Logging and monitoring for debugging and performance

**Getting Started**
Here is some guidance on how to get a copy of the project running in your local environment.

**Prerequisites**
Node.js (version 22.7.0 or higher)
npm (or yarn) for dependencies
PostgreSQL for database interactions
Necessary Environment Variables - see "dotenv" examples below


**Installation**

Clone the repo with the link

```
bash
Copy code
git clone https://github.com/username/repository-name.git
```


Install dependencies

bash
Copy code
npm install

Set up environment variables

*Check that you have installed "dotenv", if not, do so*

Copy and modify the .env.example file to match your configuration

bash
Copy code
cp .env.example
## PGDATABASE=your_database_here

Setup Database(s) and seed data

bash
Copy code
npm run setup-dbs
npm run seed

Begin hosting

bash
Copy code
npm run start

The API should now be listening on http://localhost:1789 


**Example Endpoints**

GET /api: Shows all available endpoints
GET /api/articles: Shows all articles
POST /api/topics: Posts a new topic
PATCH /api/articles/:article_id: Changes vote count on article specified by unique ID
DELETE /api/comments/:comment_id: Deletes comment specified by unique ID


**Error Handling**

Endpoint success/failure is denoted by the use of standard HTTP status codes:

200 OK: Successful request
201: Successful Creation (for POST endpoints only, successful PATCHes are included in 200)
400 Bad Request: Invalid request parameters
404 Not Found: Endpoint, Query or Unique ID not found
500 Internal Server Error: Server-side error
Testing

**Testing**

Run all tests (utils and app) using the following command:

bash
Copy code
npm test

For only tests on the server (app), run the following

bash
Copy code
npm run app-test


**Contact**
For enquires or support, general or specific, please contact:

Name: Benedict Robinson
Email: benedict.r1713@gmail.com
GitHub: benedict-robinson


**Thank you for your interest in the NC-News Backend API repository!**


--- 

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
