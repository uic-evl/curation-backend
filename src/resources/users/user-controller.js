import passport from 'passport'

const registerUser = (req, res, next) => {
  passport.authenticate('register', (err, user, info) => {
    if (err) res.status(500).send(err)
    else if (info) res.status(400).send(info)
    else
      res.status(200).send({
        user: {
          username: user.username,
          organization: user.organization,
          email: user.email,
          password: '######',
        },
      })
  })(req, res, next)
}

export {registerUser}
