import { Request, Response } from "express";
import * as bookService from "../services/books";

export const getBooks = async (req: Request, res: Response) => {
	const books = await bookService.getBooks();
	res.json(books).status(200);
};

export const getBook = async (req: Request, res: Response) => {
	const bookId = req.params.bookId;
	const book = await bookService.getBook(Number(bookId));

	if (book) {
		res.json(book).status(200);
	} else {
		res.status(404).json({ message: `No book exists with id: ${bookId}` });
	}
};

export const saveBook = async (req: Request, res: Response) => {
	const bookToBeSaved = req.body;

	try {
		const existingBook = await bookService.getBook(bookToBeSaved.bookId);

		if (existingBook) {
			res.status(409).json({
				message: `A book with id: ${bookToBeSaved.bookId} already exists`,
			});
		} else {
			const book = await bookService.saveBook(bookToBeSaved);
			res.status(201).json(book);
		}
	} catch (error) {
		res.status(400).json({ message: (error as Error).message });
	}
};

// User Story 4 - Update Book By Id Solution
export const updateBook = async (req: Request, res: Response) => {
	const bookUpdateData = req.body;
	const bookId = Number.parseInt(req.params.bookId);

	const book = await bookService.updateBook(bookId, bookUpdateData);
	res.status(204).json(book);
};

// User Story 5 - Delete Book By Id
export const deleteBook = async (req: Request, res: Response) => {
	const bookId = Number.parseInt(req.params.bookId, 10);

	if (isNaN(bookId)) {
		res.status(400).json({ message: "bookId must be numeric" });
	} else {
		const rowsDeleted = await bookService.deleteBook(bookId);

		if (isNaN(rowsDeleted) || rowsDeleted === 0) {
			res.status(404).send();
		} else {
			res.status(204).json();
		}
	}
};
