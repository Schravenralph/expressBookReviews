const express = require('express');
const public_users = express.Router();

// booksdb.js lives in this same folder
const books = require('./booksdb.js');

// If your users array lives in auth_users.js, import it here to check duplicates on register
const { users } = require('./auth_users.js');

/**
 * TASK 1:
 * Get all books
 * Use JSON.stringify to format neatly
 */
public_users.get('/', function (req, res) {
  return res
    .status(200)
    .send(JSON.stringify(books, null, 2));
});

/**
 * TASK 2:
 * Get book details by ISBN
 */
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book);
});

/**
 * TASK 3:
 * Get books by author
 *  - Obtain keys for books object
 *  - Iterate and match author from req.params
 */
public_users.get('/author/:author', function (req, res) {
  const authorParam = (req.params.author || '').toLowerCase().trim();

  const result = Object.keys(books)
    .map((isbn) => ({ isbn, ...books[isbn] }))
    .filter((b) => (b.author || '').toLowerCase().trim() === authorParam);

  if (result.length === 0) {
    return res.status(404).json({ message: 'No books found for this author' });
  }
  return res.status(200).json(result);
});

/**
 * TASK 4:
 * Get books by title (similar to Task 3)
 */
public_users.get('/title/:title', function (req, res) {
  const titleParam = (req.params.title || '').toLowerCase().trim();

  const result = Object.keys(books)
    .map((isbn) => ({ isbn, ...books[isbn] }))
    .filter((b) => (b.title || '').toLowerCase().trim() === titleParam);

  if (result.length === 0) {
    return res.status(404).json({ message: 'No books found for this title' });
  }
  return res.status(200).json(result);
});

/**
 * TASK 5:
 * Get book reviews by ISBN
 */
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: 'Book not found' });
  }
  return res.status(200).json(book.reviews || {});
});

/**
 * TASK 6:
 * Register a new user
 * - expects { "username": "...", "password": "..." } in body
 * - checks for missing fields and duplicates
 */
public_users.post('/register', function (req, res) {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const exists = users.some((u) => u.username === username);
  if (exists) {
    return res.status(409).json({ message: 'User already exists' });
  }

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

module.exports.general = public_users;
