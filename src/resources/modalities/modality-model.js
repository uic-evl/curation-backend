import mongoose, {Schema} from 'mongoose'

// recursive definition using add
// https://stackoverflow.com/questions/33825773/recursive-elements-in-schema-mongoose-modelling
const nodeSchema = new Schema()
nodeSchema.add({
  _id: {type: Schema.ObjectId, auto: true},
  name: {type: String, required: true},
  shortname: {type: String, default: ''},
  isRow: {type: Boolean, default: false},
  children: [nodeSchema],
})

const schema = Schema({
  _id: {type: Schema.ObjectId, auto: true},
  name: {type: String},
  modalities: [nodeSchema],
})

module.exports = mongoose.model('modalities', schema, 'modalities')
