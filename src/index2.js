import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import logger from 'morgan'
import passport from 'passport'
import path from 'path'
import mongoose from 'mongoose'
import bluebird from 'bluebird'

import {
  registerLocalStrategy,
  loginLocalStrategy,
  jwtStrategy,
} from './config/passport'

const router = require('./router')

// db connection
mongoose.set('useCreateIndex', true)
mongoose.connect(process.env.MONGODB, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
mongoose.Promise = bluebird
const db = mongoose.connection
db.on('error', console.log.bind(console, 'connection error: '))
db.once('open', () => {
  console.log('connected')
})

// express server
const app = express()
require('./config/passport')

app.use(cors())
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(logger('dev'))
app.use(passport.initialize())

passport.use('register', registerLocalStrategy)
passport.use('login', loginLocalStrategy)
passport.use('jwt', jwtStrategy)

app.use('/files', express.static(path.resolve(process.env.FILES_LOCATION)))

router(app, passport)

app.listen(process.env.PORT, () => console.log('Loading express server...'))
