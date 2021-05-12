import mongoose, {Schema} from 'mongoose'

const nodeSchema = new Schema({
  _id: {type: Schema.ObjectId, auto: true},
  name: {type: String, required: true},
  shortname: {type: String, default: ''},
  isRow: {type: Boolean, default: false},
  children: {type: [nodeSchema], default: []},
})

const schema = Schema({
  _id: {type: Schema.ObjectId, auto: true},
  name: {type: String},
  modalities: [nodeSchema],
})

module.exports = mongoose.model('modalities', schema, 'modalities')
