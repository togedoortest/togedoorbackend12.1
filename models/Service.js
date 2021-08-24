const mongoose = require("mongoose");

const ServiceSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    JobTitle: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    rating: {
      type: Array,
      ref: "Rating",
      required: true,
    },
    Salary: {
      type: Number,
      required: true,
    },
    avgRating: {
      type: String,
      required: true,
    },
    serviceImage: {
      type: String,
      //required: true,
    },
    subCategoryID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },
    categoryName: {
      type: String,
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Service", ServiceSchema);
