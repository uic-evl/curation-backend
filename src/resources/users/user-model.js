import mongoose, {Schema} from 'mongoose'

const userSchema = new Schema({
  _id: {type: Schema.ObjectId, auto: true},
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
  },
  password: {type: String, required: true, trim: true},
  username: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
  },
  organization: {
    type: String,
    required: true,
  },
  roles: {type: Array, default: ['curator']},
  groups: {type: Array, default: []},
  status: String,
})

module.exports = mongoose.model('user', userSchema)
