import passport from "passport";
import jwtSecret from "../config/jwtConfig";
import jwt from "jsonwebtoken";
import User from "../models/User";

exports.register = (req, res, next) => {
  passport.authenticate("register", (err, user, info) => {
    if (err) res.status(500).send(err);
    else if (info) res.status(400).send(info);
    else res.status(200).send({ message: `User ${user.username} created.` });
  })(req, res, next);
};

exports.login = (req, res, next) => {
  passport.authenticate("login", (err, user, info) => {
    if (err) res.status(500).send(err);
    else if (info) res.status(400).send(info);
    else {
      const token = jwt.sign(
        {
          sub: user.username,
          iat: new Date().getTime(),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 7,
        },
        jwtSecret.secret
      );
      res.status(200).send({
        username: user.username,
        token,
        message: "User logged in.",
      });
    }
  })(req, res, next);
};

exports.find = async (req, res, next) => {
  const users = await User.find({}, "username email");
  res.status(200).send(users);
};
