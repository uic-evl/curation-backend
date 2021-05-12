import mongoose, {Schema} from 'mongoose'

const schema = new Schema({
  _id: {type: Schema.ObjectId, auto: true},
  name: {type: String, lowercase: true, required: true},
  type: {type: String, required: true},
  state: {type: String, required: true},
  caption: {type: String, default: ''},
  observations: {type: String, default: ''},
  needsCropping: {type: Boolean, default: false},
  isCompound: {type: Boolean, default: false},
  isOvercropped: {type: Boolean, default: false},
  isMissingSubfigures: {type: Boolean, default: false},
  isMissingPanels: {type: Boolean, default: false},
  isOverfragmented: {type: Boolean, default: false},
  closeUp: {type: Boolean, default: false},
  numberSubpanes: {type: Number, default: 1},
  docId: {type: Schema.ObjectId, required: true, auto: false},
  figureId: {type: Schema.ObjectId, auto: false, default: null},
  uri: {type: String, required: true},
  modalities: {type: Array, default: []},
  flag: {type: Boolean, default: false},
  username: {type: String, default: ''},
  composition: {type: String, default: ''},
})

module.exports = mongoose.model('figure', schema)
