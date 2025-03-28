const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js"); // Assuming this is the mutable object with book data
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{
    return true; // Placeholder
}

const authenticatedUser = (username, password)=>{
    let validUser = users.find(user => user.username === username);
    if (validUser) {
        return validUser.password === password;
    } else {
        return false;
    }
}

// Login route (Task 7 - implemented)
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({ username: username }, "Secret_JWT_Phrase", { expiresIn: '1h' });
        req.session.authorization = { accessToken: accessToken };
        return res.status(200).json({ message: "User successfully logged in" });
    } else {
        return res.status(401).json({ message: "Invalid username or password" });
    }
});

// Add/Modify a book review (Task 8 - implemented)
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const reviewText = req.query.review;
    const username = req.user.username;

    if (!reviewText) {
        return res.status(400).json({ message: "Review text is required in the query parameter 'review'." });
    }

    let bookFound = false;
    let bookId = null;
    for (const key in books) {
        if (books[key].isbn === isbn) {
            bookFound = true;
            bookId = key;
            break;
        }
    }

    if (!bookFound) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    if (!books[bookId].reviews) {
        books[bookId].reviews = {};
    }
    books[bookId].reviews[username] = reviewText;

    return res.status(200).json({ message: `Review for book with ISBN ${isbn} by user ${username} added/modified successfully.` });
});

// Task 9: Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.username; // Get username from session/JWT

    let bookFound = false;
    let bookId = null;

    // Find the book's internal ID (key) based on ISBN
    for (const key in books) {
        if (books[key].isbn === isbn) {
            bookFound = true;
            bookId = key;
            break;
        }
    }

    if (!bookFound) {
        return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
    }

    // Check if the user has a review for this book
    if (books[bookId].reviews && books[bookId].reviews[username]) {
        // User has a review, delete it
        delete books[bookId].reviews[username];
        return res.status(200).json({ message: `Review by user ${username} for book with ISBN ${isbn} deleted successfully.` });
    } else {
        // User does not have a review for this book
        return res.status(404).json({ message: `Review by user ${username} not found for book with ISBN ${isbn}.` });
        // Alternatively, could return 403 Forbidden if the review exists but belongs to someone else,
        // but the requirement implies deleting based on session username only, so 404 for "no review by this user" is appropriate.
    }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
