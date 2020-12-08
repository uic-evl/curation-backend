import mongoose, { Schema } from "mongoose";

const schema = new Schema({
  _id: { type: Schema.ObjectId, auto: true },
  pubmedId: { type: String, required: true },
  entityId: { type: Schema.ObjectId },
  uri: { type: String, required: true },
  username: { type: String, default: "" },
});

module.exports = mongoose.model("document", schema);
