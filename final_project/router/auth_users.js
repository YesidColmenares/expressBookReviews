const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    return users.some(user =>
        user.username === username && user.password === password
    );
}

//only registered users can login
regd_users.post("/login", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    if (authenticatedUser(username, password)) {

        let accessToken = jwt.sign(
            { username: username },
            "access",
            { expiresIn: 60 * 60 }
        );

        req.session.authorization = {
            accessToken: accessToken
        };

        return res.status(200).json({ message: "User successfully logged in" });

    } else {
        return res.status(401).json({ message: "Invalid login credentials" });
    }

});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.username;

    if (books[isbn]) {

        books[isbn].reviews[username] = review;

        return res.status(200).json({
            message: "Review successfully added/updated",
            reviews: books[isbn].reviews
        });

    } else {
        return res.status(404).json({ message: "Book not found" });
    }

});

regd_users.delete("/auth/review/:isbn", (req, res) => {

    const isbn = req.params.isbn;
    const username = req.user.username;

    if (books[isbn]) {

        if (books[isbn].reviews[username]) {

            delete books[isbn].reviews[username];

            return res.status(200).json({
                message: "Review successfully deleted",
                reviews: books[isbn].reviews
            });

        } else {
            return res.status(404).json({ message: "You have not reviewed this book" });
        }

    } else {
        return res.status(404).json({ message: "Book not found" });
    }

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
