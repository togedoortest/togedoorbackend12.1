const mongoose = require("mongoose");

const UserSchema = mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    address: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },

    messages: {
      type: Array,
      ref: "Messages",
    },
    conversations: {
      type: Array,
      ref: "Conversations",
    },
    picture: {
      type: String,
      required: false,
    },
    userType: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
  
);

module.exports = mongoose.model("User", UserSchema);
