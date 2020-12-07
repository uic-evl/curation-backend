import jwtSecret from "./jwtConfig";
import bcrypt from "bcrypt";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JwtStrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import User from "../models/User";

const BCRYPT_SALT_ROUNDS = 12;

const registerStrategyOpts = {
  usernameField: "username",
  passwordField: "password",
  session: false,
  passReqToCallback: true,
};

const registerLocalStrategy = new LocalStrategy(
  registerStrategyOpts,
  async (req, username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (user) {
        return done(null, false, { message: "username already taken" });
      } else {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
        const email = req.body.email;
        const user = new User({ username, password: hashedPassword, email });
        const savedUser = await user.save();
        return done(null, savedUser);
      }
    } catch (err) {
      if (err.name === "MongoError" && err.code === 11000) {
        return done(null, false, { message: "email already taken" });
      } else return done(err);
    }
  }
);

const loginStrategyOpts = {
  usernameField: "username",
  passwordField: "password",
  session: false,
};
const loginLocalStrategy = new LocalStrategy(
  loginStrategyOpts,
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (user == null) {
        return done(null, false, { message: "username does not exist" });
      } else {
        const isCorrect = await bcrypt.compare(password, user.password);
        if (isCorrect) {
          return done(null, user);
        } else {
          return done(null, false, { message: "password is incorrect" });
        }
      }
    } catch (err) {
      return done(err);
    }
  }
);

const jwtStrategyOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret.secret,
  issuer: "curation",
};

const jwtStrategy = new JwtStrategy(
  jwtStrategyOpts,
  async (jwtPayload, done) => {
    try {
      const user = await User.findOne({ username: jwtPayload.sub });
      if (user) done(null, user);
      else done(null, false);
    } catch (err) {
      done(err);
    }
  }
);

exports.registerLocalStrategy = registerLocalStrategy;
exports.loginLocalStrategy = loginLocalStrategy;
exports.jwtStrategy = jwtStrategy;
