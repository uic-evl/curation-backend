import jwtSecret from './jwtConfig'
import bcrypt from 'bcrypt'
import {Strategy as LocalStrategy} from 'passport-local'
import {Strategy as JwtStrategy} from 'passport-jwt'
import {ExtractJwt} from 'passport-jwt'
import * as emailValidator from 'email-validator'
import userDB from '../resources/users/user-model'

const BCRYPT_SALT_ROUNDS = 12

const blankMessage = field => `${field} cannot be blank`
const checkUserAttributes = (email, password, username, organization) => {
  let message = null
  if (!username) return blankMessage(username)
  if (!email) return blankMessage(email)
  if (!password) return blankMessage(password)
  if (!organization) return blankMessage(organization)
  if (!emailValidator.validate(email)) return 'incorrect email format'

  return message
}

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
      const message = checkUserAttributes(
        email,
        password,
        username,
        organization,
      )
      if (message !== null) return done(null, false, {message})

      // these two validations are redundant with schema but
      // they are more user friendy
      let existingUser = await userDB.findOne({username})
      if (existingUser)
        return done(null, false, {message: 'username already taken'})
      existingUser = await userDB.findOne({email})
      if (existingUser)
        return done(null, false, {message: 'email already taken'})

      const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
      const user = new userDB({
        username,
        password: hashedPassword,
        email,
        organization,
      })
      const savedUser = await user.save()
      return done(null, savedUser)
    } catch (err) {
      if (err.name === 'ValidationError') {
        return done(null, false, {message: err.message})
      } else if (err.name === 'MongoError' && err.code === 11000) {
        // Code 11000 warns of duplicated keys, needs to see how to extract
        // the field violating the schema rule wihout using the text
        // possible alternative https://github.com/matteodelabre/mongoose-beautiful-unique-validation
        return done(null, false, {message: 'duplicated email or username'})
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
      const user = await userDB.findOne({username})
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
      const user = await userDB.findOne({username: jwtPayload.sub})
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
