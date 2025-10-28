const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js'); // lives beside this file

const regd_users = express.Router();

// Simple in-memory user store (Task 6 populates this)
let users = [];

/** Utility: is the username already registered? */
const isValid = (username) => users.some(u => u.username === username);

/** Utility: do username/password match a registered user? */
const authenticatedUser = (username, password) =>
  users.some(u => u.username === username && u.password === password);

/**
 * TASK 7:
 * Login a registered user and save credentials as a JWT in the session.
 * Endpoint (as required): POST /customer/login
 */
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }

  // Sign access token and store in session (Practice lab pattern)
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in" });
});

/**
 * TASK 8:
 * Add or modify a book review.
 * - review is provided via query (?review=...)
 * - review is stored under the logged-in username
 * - re-posting by the same user updates their review
 * Endpoint: PUT /customer/auth/review/:isbn
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const reviewText = req.query.review ?? req.body?.review;

  if (!reviewText) return res.status(400).json({ message: "Review text is required (?review=...)" });

  const username = req.session?.authorization?.username;
  if (!username) return res.status(401).json({ message: "Login required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (!book.reviews) book.reviews = {};
  const isUpdate = Boolean(book.reviews[username]);

  book.reviews[username] = reviewText;

  return res.status(200).json({
    message: isUpdate ? "Review updated" : "Review added",
    reviews: book.reviews
  });
});

/**
 * TASK 9:
 * Delete the logged-in user's review for an ISBN.
 * Endpoint: DELETE /customer/auth/review/:isbn
 */
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  const username = req.session?.authorization?.username;
  if (!username) return res.status(401).json({ message: "Login required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted", reviews: book.reviews });
  }

  return res.status(404).json({ message: "No review by this user for this ISBN" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
