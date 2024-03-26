const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username
  });

  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
}

const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return (user.username === username && user.password === password)
  });

  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
}

// 7. Only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in"});
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        "username": username,
        "password": password,
      }, 
      'access', 
      { expiresIn: 60 * 60 } // in seconds
    );
    req.session.authorization = {
      accessToken, username
    }
    return res.status(200).send("Customer successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
});

// 8. Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  let book = books[isbn];

  if (book) {
    const review = req.query.review;
    if (review) {
      book.reviews[username] = review;
      return res.status(200).send(`The review for the book with ISBN ${isbn} has been added/updated.`);
    }
    return res.status(400).send("Review Not Found.");
  }
  else {
    return res.status(400).send("Unable to find the book!");
  }
});

// 9. Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;

  let book = books[isbn];

  if (book) {
    if (Object.keys(book.reviews).includes(username)) {
      delete book.reviews[username];
      return res.status(200).send(`The review for the ISBN ${isbn} posted by the user ${username} has been deleted.`);
    }
    return res.status(400).send(`User ${username} has never leaving any review for this book.`);
  }
  else {
    return res.status(400).send("Unable to find the book!");
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
