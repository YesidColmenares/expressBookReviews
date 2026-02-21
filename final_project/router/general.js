const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

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
