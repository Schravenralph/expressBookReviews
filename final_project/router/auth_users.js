const express = require('express');
const jwt = require('jsonwebtoken');
const books = require('./booksdb.js'); // booksdb is in the same folder

const regd_users = express.Router();

let users = []; // e.g., [{ username: 'alice', password: 'pwd' }]

const isValid = (username) => {
  return users.some(u => u.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(u => u.username === username && u.password === password);
};

// only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: "Error logging in" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid Login. Check username and password" });
  }

  // issue access token and store in session (Practice lab style)
  const accessToken = jwt.sign({ username }, "access", { expiresIn: "1h" });
  req.session.authorization = { accessToken, username };

  return res.status(200).json({ message: "User successfully logged in" });
});

// Add (or update) a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Some labs pass review via query ?review=...; also support body.review
  const text = req.query.review ?? req.body?.review;
  if (!text) return res.status(400).json({ message: "Review text is required" });

  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = req.session?.authorization?.username;
  if (!username) return res.status(401).json({ message: "Login required" });

  if (!book.reviews) book.reviews = {};
  book.reviews[username] = text;

  return res.status(200).json({ message: "Review successfully posted", reviews: book.reviews });
});

// Optional: allow a user to delete their review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: "Book not found" });

  const username = req.session?.authorization?.username;
  if (!username) return res.status(401).json({ message: "Login required" });

  if (book.reviews && book.reviews[username]) {
    delete book.reviews[username];
    return res.status(200).json({ message: "Review deleted" });
  }
  return res.status(404).json({ message: "No review by this user" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
