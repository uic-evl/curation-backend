import passport from 'passport'
import jwt from 'jsonwebtoken'
import jwtSecret from '../../config/jwtConfig'

const registerUser = (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) res.status(500).send(err)
    else if (info) res.status(400).send(info)
    else
      res.status(200).send({
        username: user.username,
        organization: user.organization,
        email: user.email,
        password: '######',
      })
  })(req, res, next)
}

/** Login user and create token for 7 days */
const login = (req, res, next) => {
  passport.authenticate('login', (err, user, info) => {
    if (err) res.status(500).send(err)
    else if (info) res.status(400).send(info)
    else {
      const token = jwt.sign(
        {
          sub: user.username,
          iat: new Date().getTime(),
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 7,
        },
        jwtSecret.secret,
      )
      res.status(200).send({
        username: user.username,
        token,
      })
    }
  })(req, res, next)
}

export {registerUser, login}
