import jwtSecret from './jwtConfig'
import bcrypt from 'bcrypt'
import passport from 'passport'
import {Strategy as LocalStrategy} from 'passport-local'
import {Strategy as JwtStrategy} from 'passport-jwt'
import {ExtractJwt} from 'passport-jwt'
import * as emailValidator from 'email-validator'
import User from '../models/user'

const BCRYPT_SALT_ROUNDS = 12

const registerStrategyOpts = {
  usernameField: 'username',
  passwordField: 'password',
  session: false,
  passReqToCallback: true,
}

const registerLocalStrategy = new LocalStrategy(
  registerStrategyOpts,
  async (req, username, password, done) => {
    const {email, organization} = req.body

    try {
      if (!emailValidator.validate(email)) {
        return done(null, false, {message: 'incorrect email format'})
      }

      const user = await User.findOne({username})
      if (user) {
        return done(null, false, {message: 'username already taken'})
      } else {
        const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
        const user = new User({
          username,
          password: hashedPassword,
          email,
          organization,
        })
        const savedUser = await user.save()
        return done(null, savedUser)
      }
    } catch (err) {
      if (err.name === 'ValidationError') {
        return done(null, false, {message: err.message})
      } else if (err.name === 'MongoError' && err.code === 11000) {
        return done(null, false, {message: 'email already taken'})
      } else return done(err)
    }
  },
)

const loginStrategyOpts = {
  usernameField: 'username',
  passwordField: 'password',
  session: false,
}
const loginLocalStrategy = new LocalStrategy(
  loginStrategyOpts,
  async (username, password, done) => {
    try {
      const user = await User.findOne({username})
      if (user == null) {
        return done(null, false, {message: 'username does not exist'})
      } else {
        const isCorrect = await bcrypt.compare(password, user.password)
        if (isCorrect) {
          return done(null, user)
        } else {
          return done(null, false, {message: 'password is incorrect'})
        }
      }
    } catch (err) {
      return done(err)
    }
  },
)

const jwtStrategyOpts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: jwtSecret.secret,
}

const jwtStrategy = new JwtStrategy(
  jwtStrategyOpts,
  async (jwtPayload, done) => {
    try {
      const user = await User.findOne({username: jwtPayload.sub})
      if (user) done(null, user)
      else done(null, false)
    } catch (err) {
      done(err)
    }
  },
)

exports.registerLocalStrategy = registerLocalStrategy
exports.loginLocalStrategy = loginLocalStrategy
exports.jwtStrategy = jwtStrategy
