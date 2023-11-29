# 📖 Minimalist Book Manager API

## Introduction

This is the starter repository for the Further APIs session. It provides a start to creating a Minimalist Book Manager API.

### Pre-Requisites

- NodeJS installed (v18.12.1 Long Term Support version at time of writing)

### Technologies & Dependencies

- [TypeScript](https://www.typescriptlang.org/)
- [ExpressJS](https://expressjs.com/)
- [Sequelize](https://sequelize.org/)
- [SQLite3](https://www.npmjs.com/package/sqlite3)
- [Jest](https://jestjs.io/)
- [Supertest](https://www.npmjs.com/package/supertest)
- [ESLint](https://eslint.org/)

### How to Get Started

- Fork this repo to your Github and then clone the forked version of this repo

### Running the application

In order to run the unit tests run, firstly install the dependencies (if you haven't already done so)

```
npm install
```

Followed by:

```
npm start
```

### Running the Unit Tests

In order to run the unit tests run, firstly install the dependencies (if you haven't already done so)

```
npm install
```

Followed by:

```
npm test
```

### User Story: As a user, I want to use the Book Manager API to delete a book using its ID

To delete a book, the user must send a DELETE request to the /books/:bookId endpoint

> DELETE /books/99

where :bookId is the numeric identifier of the book to be deleted.

#### Responses

##### Success

- 303 - See Other[^1]
- Location: /books

  If the book was successfully deleted the client will receive a 303 - See Other response plus a Location header containing the URL to the books collection.

##### Unknown BookId

- 404 - Not Found[^2]

If the bookId is numeric but was not found in the Book repository the client will receive a 404 - Not Found response indicating that no book exists with that id and no action was taken.

##### Invalid bookId

- 400 - Bad Request

- Body
  > message: "bookId must be numeric"

If a non-numeric book id was supplied the client will receive a 400 - Bad Request response with a message in the body indicating the problem.

Footnotes:

[^1]: A 204 - Done response was rejected as a client would not navigate away from the deleted book's URL.
[^2]: A 410 - Gone response was rejected as it indicates the id did previously exists which would necessitate tracking deleted book ids and ensuring they are not used again.
