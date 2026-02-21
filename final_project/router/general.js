const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Función que devuelve los libros como promesa (simula DB asincrónica)
const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        if (books) {
            resolve(books);
        } else {
            reject("No books available");
        }
    });
};

public_users.post("/register", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (isValid(username)) {
        return res.status(409).json({ message: "User already exists" });
    }

    users.push({ username: username, password: password });

    return res.status(200).json({ message: "User successfully registered. Now you can login" });

});


public_users.get('/', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        return res.status(200).json(JSON.stringify(allBooks, null, 4));
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

public_users.get('/task10', async (req, res) => {
    try {
        // Llamada HTTP a tu propia API usando Axios
        const response = await axios.get('http://localhost:5000/');
        const booksList = response.data;

        return res.status(200).json({
            message: "Books fetched successfully using Axios + Async-Await",
            books: booksList
        });

    } catch (err) {
        return res.status(500).json({ message: "Error fetching books", error: err.message });
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        const isbn = req.params.isbn;
        const book = allBooks[isbn];

        if (book) {
            return res.status(200).json(JSON.stringify(book, null, 4));
        } else {
            return res.status(404).json({ message: "Book not found" });
        }
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

// Tarea 11: Obtener detalles de un libro por ISBN usando Axios + Async-Await
public_users.get('/task11/:isbn', async (req, res) => {
    try {
        const isbn = req.params.isbn;

        // Llamada HTTP a tu propio endpoint /isbn/:isbn
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        
        // response.data contiene los datos del libro
        return res.status(200).json({
            message: `Book details fetched successfully for ISBN ${isbn}`,
            book: response.data
        });
    } catch (err) {
        // Si Axios falla (ej. ISBN no existe o servidor apagado)
        return res.status(500).json({
            message: `Error fetching book with ISBN ${req.params.isbn}`,
            error: err.message
        });
    }
});

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        const author = req.params.author;
        let filteredBooks = {};

        Object.keys(allBooks).forEach(key => {
            if (allBooks[key].author === author) {
                filteredBooks[key] = allBooks[key];
            }
        });

        if (Object.keys(filteredBooks).length > 0) {
            return res.status(200).json(JSON.stringify(filteredBooks, null, 4));
        } else {
            return res.status(404).json({ message: "No books found for this author" });
        }
    } catch(err) {
        return res.status(500).json({ message: err });
    }
});

// Tarea 12: Obtener libros por autor usando Axios + Async-Await
public_users.get('/task12/:author', async (req, res) => {
    try {
        const author = req.params.author;

        // Llamada HTTP a tu propio endpoint /author/:author
        const response = await axios.get(`http://localhost:5000/author/${author}`);
        
        // response.data contiene los datos filtrados
        return res.status(200).json({
            message: `Books fetched successfully for author ${author}`,
            books: response.data
        });
    } catch (err) {
        return res.status(500).json({
            message: `Error fetching books for author ${req.params.author}`,
            error: err.message
        });
    }
});

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const allBooks = await getBooksAsync();
        const title = req.params.title;
        let filteredBooks = {};

        Object.keys(allBooks).forEach(key => {
            if (allBooks[key].title === title) {
                filteredBooks[key] = allBooks[key];
            }
        });

        if (Object.keys(filteredBooks).length > 0) {
            return res.status(200).json(JSON.stringify(filteredBooks, null, 4));
        } else {
            return res.status(404).json({ message: "No books found with this title" });
        }
    } catch(err) {
        return res.status(500).json({ message: err });
    }
});

// Tarea 13: Obtener libros por título usando Axios + Async-Await
public_users.get('/task13/:title', async (req, res) => {
    try {
        const title = req.params.title;

        // Llamada HTTP a tu propio endpoint /title/:title
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        
        // response.data contiene los datos filtrados
        return res.status(200).json({
            message: `Books fetched successfully for title "${title}"`,
            books: response.data
        });
    } catch (err) {
        return res.status(500).json({
            message: `Error fetching books with title "${req.params.title}"`,
            error: err.message
        });
    }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {

    const isbn = req.params.isbn;
    const book = books[isbn];

    if (book) {
        return res.status(200).json(JSON.stringify(book.reviews, null, 4));
    } else {
        return res.status(404).json({ message: "Book not found" });
    }

});

module.exports.general = public_users;
