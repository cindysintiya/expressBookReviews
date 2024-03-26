const express = require('express');
const axios = require('axios').default;

let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;

const public_users = express.Router();
const async_callbacks = express.Router();

// 6. Register new User
public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({
        "username":username,
        "password":password,
      });
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "Customer already exists!"});    
    }
  } 
  return res.status(400).json({message: "Unable to register user."});
});

const reformatBooks = () => Object.keys(books).map((id) => {
  return {
    "isbn": id,
    "title": books[id].title,
    "author": books[id].author,
    "reviews": books[id].reviews,
  }
});

// 1. Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// 2. Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (isbn && books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).send("Book Not Found");
});
  
// 3. Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  if (author) {
    const foundedBooks = reformatBooks().filter((book) => book.author.toLowerCase() === author.toLowerCase());

    if (foundedBooks.length) {
      foundedBooks.forEach((book) => {
        delete book.author
      });
      const booksByAuthor = {
        "booksbyauthor" : foundedBooks,
      }
      return res.status(200).send(JSON.stringify(booksByAuthor, null, 4));
    } else {
      return res.status(404).send("Can't find this author's book(s)");
    }
  }
});

// 4. Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  if (title) {
    const foundedBooks = reformatBooks().filter((book) => book.title.toLowerCase() === title.toLowerCase());

    if (foundedBooks.length) {
      foundedBooks.forEach((book) => {
        delete book.title
      });
      const booksByTitle = {
        "booksbytitle" : foundedBooks
      }
      return res.status(200).send(JSON.stringify(booksByTitle, null, 4));
    } else {
      return res.status(404).send("Can't find any book with this title");
    }
  }
});

// 5. Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  if (isbn && books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).send("Book Not Found");
});

// const URL = "https://u211110347-5000.theianext-1-labs-prod-misc-tools-us-east-0.proxy.cognitiveclass.ai/";
const URL = "http://localhost:5000";

// 10. Get all books – Using async callback function
async_callbacks.get('/', async (req, res) => {
  await axios.get(`${URL}/`)
    .then((result) => {
      return res.status(result.status).send(JSON.stringify(result.data, null, 4));
    })
    .catch((err) => {
      if (err.response.status == 404) {
        return res.status(404).send(err.response.data);
      } else {
        return res.status(500).send("Oh No! Internal Server Error");
      };
    });
});

// 11. Search by ISBN – Using Promises
async_callbacks.get('/isbn/:isbn', function (req, res) {
  const getBooks = new Promise((resolve, reject) => {
    const isbn = req.params.isbn;

    if (isbn && books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book Not Found");
    }
  })
  
  getBooks
    .then((result) => {
      return res.status(200).send(JSON.stringify(result, null, 4));
    })
    .catch((err) => {
      return res.status(404).send(err);
    });
});

// 12. Search by Author - Async-await
async_callbacks.get('/author/:author', async (req, res) => {
  await axios.get(`${URL}/author/${req.params.author}`)
    .then((result) => {
      return res.status(result.status).send(JSON.stringify(result.data, null, 4));
    })
    .catch((err) => {
      if (err.response.status == 404) {
        return res.status(404).send(err.response.data);
      } else {
        return res.status(500).send("Oh No! Internal Server Error");
      }
    });
});

// 13. Search by Title - Async-await
async_callbacks.get('/title/:title', async (req, res) => {
  await axios.get(`${URL}/title/${req.params.title}`)
    .then((result) => {
      return res.status(result.status).send(JSON.stringify(result.data, null, 4));
    })
    .catch((err) => {
      if (err.response.status == 404) {
        return res.status(404).send(err.response.data);
      } else {
        return res.status(500).send("Oh No! Internal Server Error");
      }
    });
});

module.exports.general = public_users;
module.exports.async = async_callbacks;
