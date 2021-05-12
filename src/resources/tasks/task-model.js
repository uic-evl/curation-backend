import mongoose, {Schema} from 'mongoose'

const schema = new Schema({
  _id: {type: Schema.ObjectId, auto: true},
  assignedTo: {type: Array, required: true},
  creationDate: {type: Date, required: true},
  status: {type: String, required: true},
  type: {type: String, required: true},
  assignedDate: {type: Date},
  description: {type: String, default: ''},
  endDate: {type: Date},
  startDate: {type: Date},
  taskPerformer: {type: String, default: ''}, // who finished the task
  url: {type: String},
  username: {type: String, default: ''},
  userId: {type: Schema.ObjectId},
  docId: {type: Schema.ObjectId},
  taxonomy: {type: String},
})

module.exports = mongoose.model('task', schema)
