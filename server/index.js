"use strict";

const express = require("express");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/user");
const authCheck = require("./middleware/authCheck");

const app = express();
app
  .use(morgan("dev"))
  .use(express.json())
  .use(
    express.urlencoded({
      extended: true,
    })
  )
  .use(cors());

//port declaration
const port = 3000;

//SIGN UP
app.post("/signUp", (req, res) => {
  User.findOne({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user) {
        res.status(422).json({
          message: "User already exists",
        });
      } else {
        bcrypt
          .hash(req.body.email + req.body.password, 10)
          .then((hash) => {
            const user = new User({
              email: req.body.email,
              password: hash,
            });
            user
              .save()
              .then((createdUser) => {
                res.status(201).json({
                  message: "User created",
                  user: createdUser,
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  error: err,
                });
              });
          })
          .catch((err) => {
            console.log(err);
            res.status(500).json({
              error: err,
            });
          });
      }
    })
    .catch();
});

app.post("/login", (req, res) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length < 1) {
        return res.status(401).json({
          message: "Wrong email or password",
        }); //sor? return niye yazdık res.status veya res.json, return işlevi görmüyor mu?
      } else {
        bcrypt
          .compare(req.body.email + req.body.password, user[0].password)
          .then((result) => {
            if (result) {
              const token = jwt.sign(
                {
                  email: user[0].email,
                },
                "238hlaksndcipja9wue9f8ujw9fu98wu20o"
              );
              return res.status(200).json({
                message: "Auth successful",
                token: token,
              });
            } else {
              console.log("here");
              return res.status(401).json({
                message: "Wrong email or password",
              });
            }
          })
          .catch((err) => {
            console.log(err);
            res.status(401).json({
              message: "Auth failed",
            });
          }); //error of comparing the password with hash
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    }); //error for searching for the client with the registered e-mail
});

app.post("/signOut", authCheck, (req, res) => {
  res.json({
    verified: true,
  });
});

app.post("/deleteAccount", authCheck, (req, res) => {
  User.deleteOne({ email: req.userData.email })
    .exec()
    .then((result) => {
      if (result.deletedCount === 1) {
        res.status(200).json({
          message: "Account deleted",
          verified: true,
        });
      } else {
        res.status(404).json({
          message: "Account doesn't exist",
          verified: false,
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
        verified: false,
      });
    });
});

//connecting to database and listening to the port
const dbUrl =
  "mongodb+srv://ozduranbaran:636636Bc@cluster0.opbgo.mongodb.net/filmApp?retryWrites=true&w=majority";
mongoose
  .connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() =>
    app.listen(port, () =>
      console.log(
        `Connected to mongoDB database soooo let's start listening on PORT ${port}`
      )
    )
  )
  .catch((err) => console.log(err));
