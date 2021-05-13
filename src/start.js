import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import logger from 'morgan' //todo
import passport from 'passport'
import https from 'https'
import {startDatabase} from './db/database'
import {
  registerLocalStrategy,
  loginLocalStrategy,
  jwtStrategy,
} from './utils/auth'
import getRouter from './routes'
import errorMiddleware from './utils/error-middleware'

const startServer = ({port = process.env.PORT} = {}) => {
  startDatabase()

  // express setup
  let app = express()
  app.use(cors())
  app.use(express.json())
  app.use(logger('dev')) // TODO update based on environment

  // authentication setup
  app.use(passport.initialize())
  passport.use('register', registerLocalStrategy)
  passport.use('login', loginLocalStrategy)
  passport.use('jwt', jwtStrategy)

  const router = getRouter(passport)
  app.use('/api', router)
  app.use(errorMiddleware)

  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(`server started on port ${port}`)
      const originalClose = server.close.bind(server)
      server.close = () => {
        return new Promise(resolveClose => {
          originalClose(resolveClose)
        })
      }
    })
    resolve(server)
  })
}

export default startServer
