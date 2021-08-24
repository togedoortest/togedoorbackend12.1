const mongoose = require("mongoose");

const MessagesSchema = mongoose.Schema(
  {
 
    Topic: {
      type: String
     
    },
    
    conversationsID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversations",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Messages", MessagesSchema);
