const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const Category = require("../models/Category");
const Service = require("../models/Service");

// @route     GET /categories
// @desc      Get all categories
// @access    Public
router.get("/",async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET /categories/:id
// @desc      Get Single Category
// @access    Public
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(400).json({ msg: "Category doesn't exist" });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET /categories/name/:name
// @desc      Get Single Category
// @access    Public
router.get("/name/:name".split(" ").join(""), async (req, res) => {
  try {
    const name = req.params.name.split("-").join(" ");
    let category = await Category.findOne({ name });

    if (!category) {
      return res.status(400).json({ msg: "Category doesn't exist" });
    }

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     POST /categories
// @desc      Create Category
// @access    Public
router.post("/create", async (req, res) => {
  const { name, description, subcategories } = req.body;

  try {
    const newCategory = new Category({
      name,
      description,
      subcategories,
    });

    const category = await newCategory.save();

    res.json(category);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
