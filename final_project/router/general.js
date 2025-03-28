const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Task 10: Get the book list available in the shop (using Promises)
public_users.get('/', function (req, res) {
    const getBooksPromise = new Promise((resolve, reject) => {
        process.nextTick(() => {
            try {
                if (books) {
                    resolve(books);
                } else {
                    reject(new Error("Book data is unavailable."));
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    getBooksPromise
        .then(bookList => res.status(200).json(bookList))
        .catch(error => {
            console.error("Task 10 Promise Error:", error.message);
            res.status(500).json({ message: error.message || "Internal Server Error fetching book list" });
        });
});

// Task 11: Get book details based on ISBN (using Promises)
public_users.get('/isbn/:isbn', function (req, res) {
    const requestedIsbn = req.params.isbn;
    const getBookByIsbnPromise = new Promise((resolve, reject) => {
        process.nextTick(() => {
            try {
                let foundBook = null;
                for (const key in books) {
                    if (books[key].isbn === requestedIsbn) {
                        foundBook = books[key];
                        break;
                    }
                }
                if (foundBook) {
                    resolve(foundBook);
                } else {
                    // Reject specifically for "not found"
                    reject(new Error(`Book not found for ISBN ${requestedIsbn}`));
                }
            } catch (error) {
                reject(error); // Catch any sync errors during search
            }
        });
    });

    getBookByIsbnPromise
        .then(book => res.status(200).json(book))
        .catch(error => {
            // Check if it was our "not found" rejection
            if (error.message.startsWith("Book not found")) {
                res.status(404).json({ message: error.message });
            } else {
                // Handle other unexpected errors
                console.error("Task 11 Promise Error:", error.message);
                res.status(500).json({ message: "Internal Server Error fetching book by ISBN" });
            }
        });
});

// Task 12: Get book details based on Author (using Promises)
public_users.get('/author/:author', function (req, res) {
    const requestedAuthor = req.params.author;
    const getBooksByAuthorPromise = new Promise((resolve, reject) => {
        process.nextTick(() => {
            try {
                const foundBooks = [];
                for (const key in books) {
                    if (books[key].author.toLowerCase() === requestedAuthor.toLowerCase()) {
                        foundBooks.push({ id: key, ...books[key] });
                    }
                }
                if (foundBooks.length > 0) {
                    resolve({ booksbyauthor: foundBooks });
                } else {
                    // Reject specifically for "not found"
                    reject(new Error(`No books found for author ${requestedAuthor}`));
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    getBooksByAuthorPromise
        .then(result => res.status(200).json(result))
        .catch(error => {
            if (error.message.startsWith("No books found")) {
                res.status(404).json({ message: error.message });
            } else {
                console.error("Task 12 Promise Error:", error.message);
                res.status(500).json({ message: "Internal Server Error fetching books by author" });
            }
        });
});

// Task 13: Get book details based on Title (using Promises)
public_users.get('/title/:title', function (req, res) {
    const requestedTitle = req.params.title;
    const getBooksByTitlePromise = new Promise((resolve, reject) => {
        process.nextTick(() => {
            try {
                const foundBooks = [];
                for (const key in books) {
                    if (books[key].title.toLowerCase() === requestedTitle.toLowerCase()) {
                        foundBooks.push({ id: key, ...books[key] });
                    }
                }
                if (foundBooks.length > 0) {
                    resolve({ booksbytitle: foundBooks });
                } else {
                    // Reject specifically for "not found"
                    reject(new Error(`No books found for title ${requestedTitle}`));
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    getBooksByTitlePromise
        .then(result => res.status(200).json(result))
        .catch(error => {
            if (error.message.startsWith("No books found")) {
                res.status(404).json({ message: error.message });
            } else {
                console.error("Task 13 Promise Error:", error.message);
                res.status(500).json({ message: "Internal Server Error fetching books by title" });
            }
        });
});


// Task 5: Get book reviews based on ISBN (Original Synchronous Implementation - Remains unchanged)
public_users.get('/review/:isbn', function (req, res) {
    const requestedIsbn = req.params.isbn;
    let bookReviews = null;
    let bookFound = false;

    for (const key in books) {
        if (books[key].isbn === requestedIsbn) {
            bookFound = true;
            bookReviews = books[key].reviews;
            break;
        }
    }

    if (bookFound) {
        if (bookReviews && Object.keys(bookReviews).length > 0) {
            return res.status(200).json(bookReviews);
        } else {
            return res.status(200).json({});
        }
    } else {
        return res.status(404).json({ message: "Book not found for the provided ISBN" });
    }
});

// Task 6: Register a new user (Original Synchronous Implementation - Remains unchanged)
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }
    const doesExist = users.some(user => user.username === username);
    if (doesExist) {
        return res.status(409).json({ message: "Username already exists" });
    }
    users.push({ "username": username, "password": password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});


module.exports.general = public_users;


/* const express = require('express');
let books = require("./booksdb.js"); // Assumes keys are IDs 1, 2, ... and values are {isbn, author, title, reviews}
let isValid = require("./auth_users.js").isValid; // Assuming this might be for username format validation, not used directly here for existence check.
let users = require("./auth_users.js").users; // Assuming this is an array like [{username, password}, ...]
const public_users = express.Router();

// Task 6: Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists in the 'users' array
    const doesExist = users.some(user => user.username === username);

    if (doesExist) {
        return res.status(409).json({ message: "Username already exists" });
    }

    // Add the new user to the 'users' array
    // IMPORTANT: In a real application, passwords should be hashed! Storing plain text is insecure.
    users.push({ "username": username, "password": password });

    return res.status(201).json({ message: "User successfully registered. Now you can login." });
});

// Task 1: Get the book list available in the shop
public_users.get('/', function (req, res) {
    // Send the entire books object, formatted as JSON
    return res.status(200).json(books);
    // For pretty-printing during testing:
    // return res.status(200).send(JSON.stringify(books, null, 2));
});

// Task 2: Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const requestedIsbn = req.params.isbn;
    let foundBook = null;

    // Iterate through the book objects in the 'books' collection
    for (const key in books) {
        if (books[key].isbn === requestedIsbn) {
            foundBook = books[key];
            break; // Stop searching once found
        }
    }

    if (foundBook) {
        return res.status(200).json(foundBook);
    } else {
        return res.status(404).json({ message: "Book not found for the provided ISBN" });
    }
});

// Task 3: Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const requestedAuthor = req.params.author;
    const foundBooks = [];

    // Iterate through the book objects
    for (const key in books) {
        // Case-insensitive comparison
        if (books[key].author.toLowerCase() === requestedAuthor.toLowerCase()) {
            // Include the book ID along with the book details might be useful
            foundBooks.push({id: key, ...books[key]});
        }
    }

    if (foundBooks.length > 0) {
        // Return object containing the list of books found
        return res.status(200).json({booksbyauthor: foundBooks});
    } else {
        return res.status(404).json({ message: "No books found for the provided author" });
    }
});

// Task 4: Get all books based on title
public_users.get('/title/:title', function (req, res) {
    const requestedTitle = req.params.title;
    const foundBooks = [];

    // Iterate through the book objects
    for (const key in books) {
        // Case-insensitive comparison
        if (books[key].title.toLowerCase() === requestedTitle.toLowerCase()) {
             // Include the book ID along with the book details
            foundBooks.push({id: key, ...books[key]});
        }
    }

    if (foundBooks.length > 0) {
         // Return object containing the list of books found
        return res.status(200).json({booksbytitle: foundBooks});
    } else {
        return res.status(404).json({ message: "No books found for the provided title" });
    }
});

// Task 5: Get book reviews based on ISBN
public_users.get('/review/:isbn', function (req, res) {
    const requestedIsbn = req.params.isbn;
    let bookReviews = null;
    let bookFound = false;

    // Find the book by ISBN
    for (const key in books) {
        if (books[key].isbn === requestedIsbn) {
            bookFound = true;
            bookReviews = books[key].reviews; // Get the reviews object for that book
            break;
        }
    }

    if (bookFound) {
        // Check if the reviews object exists and is not empty
        if (bookReviews && Object.keys(bookReviews).length > 0) {
            return res.status(200).json(bookReviews);
        } else {
            // Book found, but no reviews available
            return res.status(200).json({}); // Send empty object
        }
    } else {
        // Book with the given ISBN not found
        return res.status(404).json({ message: "Book not found for the provided ISBN" });
    }
});

module.exports.general = public_users;

*/
