import mongoose, {Schema} from 'mongoose'

const schema = Schema({
  modality1: {type: String},
  modality2: {type: String},
  modality3: {type: String},
  modality4: {type: String},
  columnName: {type: String},
  columnLabel: {type: String},
  simplify: {type: String},
  order: {type: Number},
})

module.exports = mongoose.model('modalities', schema, 'modalities')
