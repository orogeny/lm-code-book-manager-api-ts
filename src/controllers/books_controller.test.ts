import request from "supertest";
import { app } from "../app";
import { Book } from "../models/book";

import * as bookService from "../services/books";
jest.mock("../services/books");

afterEach(() => {
	jest.clearAllMocks();
});

const dummyBookData = [
	{
		bookId: 1,
		title: "The Hobbit",
		author: "J. R. R. Tolkien",
		description: "Someone finds a nice piece of jewellery while on holiday.",
	},
	{
		bookId: 2,
		title: "The Shop Before Life",
		author: "Neil Hughes",
		description:
			"Before being born, each person must visit the magical Shop Before Life, where they choose what kind of person they will become down on Earth...",
	},
];

describe("GET /api/v1/books endpoint", () => {
	test("status code successfully 200", async () => {
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("books successfully returned as empty array when no data returned from the service", async () => {
		// Arrange
		jest.spyOn(bookService, "getBooks").mockResolvedValue([]);
		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual([]);
		expect(res.body.length).toEqual(0);
	});

	test("books successfully returned as array of books", async () => {
		// Arrange

		// NB the "as" to `Book[]` takes care of all the missing properties added by sequelize
		//    such as createdDate etc, that we don't care about for the purposes of this test
		jest
			.spyOn(bookService, "getBooks")
			.mockResolvedValue(dummyBookData as Book[]);

		// Act
		const res = await request(app).get("/api/v1/books");

		// Assert
		expect(res.body).toEqual(dummyBookData);
		expect(res.body.length).toEqual(2);
	});
});

describe("GET /api/v1/books/{bookId} endpoint", () => {
	test("status code successfully 200 for a book that is found", async () => {
		// Arrange
		const mockGetBook = jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(200);
	});

	test("status code successfully 404 for a book that is not found", async () => {
		// Arrange

		jest
			.spyOn(bookService, "getBook")
			// this is a weird looking type assertion!
			// it's necessary because TS knows we can't actually return unknown here
			// BUT we want to check that in the event a book is missing we return a 404
			.mockResolvedValue(undefined as unknown as Book);
		// Act
		const res = await request(app).get("/api/v1/books/77");

		// Assert
		expect(res.statusCode).toEqual(404);

		expect(res.body).toEqual({ message: "No book exists with id: 77" });
	});

	test("controller successfully returns book object as JSON", async () => {
		// Arrange
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[1] as Book);

		// Act
		const res = await request(app).get("/api/v1/books/2");

		// Assert
		expect(res.body).toEqual(dummyBookData[1]);
	});
});

describe("POST /api/v1/books endpoint", () => {
	test("status code successfully 201 for saving a valid book", async () => {
		// Arrange - we need bookService to respond with null, the bookId is not known
		jest.spyOn(bookService, "getBook").mockResolvedValue(null);

		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ bookId: 3, title: "Fantastic Mr. Fox", author: "Roald Dahl" });

		// Assert
		expect(res.statusCode).toEqual(201);
	});

	test("status code 409 Conflict when book id already exists", async () => {
		// Arrange - we need bookService to return an existing book
		jest
			.spyOn(bookService, "getBook")
			.mockResolvedValue(dummyBookData[0] as Book);

		//Act
		const res = await request(app).post("/api/v1/books").send({
			bookId: 1,
			title: "Telephone Directory",
			author: "British Telecom",
		});

		// Assert
		expect(res.statusCode).toEqual(409);
	});

	test("status code 400 when saving ill formatted JSON", async () => {
		// Arrange - we can enforce throwing an exception by mocking the implementation
		jest.spyOn(bookService, "getBook").mockResolvedValue(null);
		jest.spyOn(bookService, "saveBook").mockImplementation(() => {
			throw new Error("Error saving book");
		});

		// Act
		const res = await request(app)
			.post("/api/v1/books")
			.send({ title: "Fantastic Mr. Fox", author: "Roald Dahl" }); // No bookId

		// Assert
		expect(res.statusCode).toEqual(400);
	});
});

describe("DELETE /api/v1/books/{bookId} endpoint", () => {
	test("none-numeric bookId parameter returns 400 - Bad Request", async () => {
		// Act
		const res = await request(app).delete("/api/v1/books/abc").query({});

		// Assert
		expect(res.statusCode).toEqual(400);
	});

	test("deleting an existing book returns 1 row deleted", async () => {
		// Arrange
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(1);

		// Act
		const res = await request(app).delete("/api/v1/books/2");

		// Assert
		expect(res.statusCode).toEqual(204);
	});

	test("deleting a non-existent book returns 0 row deleted", async () => {
		// Arrange
		jest.spyOn(bookService, "deleteBook").mockResolvedValue(0);

		// Act
		const res = await request(app).delete("/api/v1/books/99");

		// Assert
		expect(res.statusCode).toEqual(404);
	});
});
