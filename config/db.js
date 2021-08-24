const mongoose = require("mongoose");

const db = async () => {
  try {
      await mongoose.connect("mongodb+srv://togeDoor:togeDoor123@cluster0.n4ve2.mongodb.net/togeDoor?retryWrites=true&w=majority", {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    console.log("MongoDB Connected...");
    console.log("------------------------------------------------");
  } catch (err) {
    console.error('`db.js` err.message:_', err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = db;
