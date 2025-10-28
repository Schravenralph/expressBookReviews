const express = require('express');
const axios = require('axios');
const public_users = express.Router();

// booksdb.js lives in the same folder
const books = require('./booksdb.js');

// Import users from auth_users.js (for registration)
const { users } = require('./auth_users.js');

/* ===========================================================
   TASKS 1–6: BASIC FUNCTIONALITY
   =========================================================== */

/** TASK 1: Get all books */
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 2));
});

/** TASK 2: Get book details by ISBN */
public_users.get('/isbn/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book);
});

/** TASK 3: Get books by author */
public_users.get('/author/:author', function (req, res) {
  const authorParam = (req.params.author || '').toLowerCase().trim();

  const result = Object.keys(books)
    .map((isbn) => ({ isbn, ...books[isbn] }))
    .filter((b) => (b.author || '').toLowerCase().trim() === authorParam);

  if (result.length === 0)
    return res.status(404).json({ message: 'No books found for this author' });
  return res.status(200).json(result);
});

/** TASK 4: Get books by title */
public_users.get('/title/:title', function (req, res) {
  const titleParam = (req.params.title || '').toLowerCase().trim();

  const result = Object.keys(books)
    .map((isbn) => ({ isbn, ...books[isbn] }))
    .filter((b) => (b.title || '').toLowerCase().trim() === titleParam);

  if (result.length === 0)
    return res.status(404).json({ message: 'No books found for this title' });
  return res.status(200).json(result);
});

/** TASK 5: Get book reviews by ISBN */
public_users.get('/review/:isbn', function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.status(200).json(book.reviews || {});
});

/** TASK 6: Register a new user */
public_users.post('/register', function (req, res) {
  const { username, password } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password are required' });

  const exists = users.some((u) => u.username === username);
  if (exists) return res.status(409).json({ message: 'User already exists' });

  users.push({ username, password });
  return res.status(201).json({ message: 'User successfully registered' });
});

/* ===========================================================
   TASKS 10–13: ASYNC/AWAIT WITH AXIOS
   =========================================================== */

/** TASK 10: Get all books (async) */
public_users.get('/async/books', async (req, res) => {
  try {
    const base = `${req.protocol}://${req.get('host')}`;
    const { data } = await axios.get(`${base}/`);
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      message: 'Error fetching books asynchronously',
      error: err.message
    });
  }
});

/** TASK 11: Get book by ISBN (async) */
public_users.get('/async/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;
    const base = `${req.protocol}://${req.get('host')}`;
    const { data } = await axios.get(`${base}/isbn/${isbn}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: 'Error fetching book by ISBN', error: err.message });
  }
});

/** TASK 12: Get books by author (async) */
public_users.get('/async/author/:author', async (req, res) => {
  try {
    const { author } = req.params;
    const base = `${req.protocol}://${req.get('host')}`;
    const { data } = await axios.get(`${base}/author/${encodeURIComponent(author)}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: 'Error fetching books by author', error: err.message });
  }
});

/** TASK 13: Get books by title (async) */
public_users.get('/async/title/:title', async (req, res) => {
  try {
    const { title } = req.params;
    const base = `${req.protocol}://${req.get('host')}`;
    const { data } = await axios.get(`${base}/title/${encodeURIComponent(title)}`);
    return res.status(200).json(data);
  } catch (err) {
    const status = err.response?.status || 500;
    return res
      .status(status)
      .json({ message: 'Error fetching books by title', error: err.message });
  }
});

module.exports.general = public_users;
