const mongoose = require("mongoose");

const ConversationsSchema = mongoose.Schema(
  {
      
    UserName:{
        type:String

    },
    ConnectedUserID:{
        type: mongoose.Schema.Types.ObjectId,
    //   ref: "User",
    },
    messages: {
        type: Array,
        ref: "Messages",
      },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Conversations", ConversationsSchema);
