import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  _id: { type: Schema.ObjectId, auto: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
  },
  password: String,
  username: {
    type: String,
    unique: true,
    lowercase: true,
  },
  status: String,
});

module.exports = mongoose.model("user", userSchema);
