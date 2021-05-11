import 'dotenv/config'
import mongoose from 'mongoose'

const startDatabase = async () => {
  const db_uri = process.env.MONGODB_URI
  if (process.env.NODE_ENV !== 'production') {
    console.log(`attempting connection to ${db_uri}`)
  }

  mongoose.connect(db_uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })

  const db = mongoose.connection
  db.on('error', console.error.bind(console, 'connection error:'))
  db.once('open', function () {
    console.log('connection to database established')
  })
}

module.exports = {startDatabase}
