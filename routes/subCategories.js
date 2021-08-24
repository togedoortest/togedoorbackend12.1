const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const SubCategory = require("../models/SubCategory");
const Service = require("../models/Service");
const Category = require("../models/Category");

// @route     GET /subcategories
// @desc      Get all subcategories
// @access    Public
router.get("/", async (req, res) => {
  try {
    const subCategories = await SubCategory.find();

    res.json(subCategories);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET /subcategories/:id
// @desc      Get Single SubCategory
// @access    Public
router.get("/:id", async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id);

    if (!subCategory) {
      return res.status(400).json({ msg: "SubCategory doesn't exist" });
    }

    res.json(subCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET /subcategories/name/:name
// @desc      Get Single Category
// @access    Public
router.get("/name/:name".split(" ").join(""), async (req, res) => {
  try {
    const name = req.params.name.split("-").join(" ");
    let subcategory = await SubCategory.findOne({ name });

    if (!subcategory) {
      return res.status(400).json({ msg: "SubCategory doesn't exist" });
    }

    res.json(subcategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     POST /subcategories
// @desc      Create SubCategory
// @access    Public
router.post("/create", async (req, res) => {
  const { name, description, categoryID } = req.body;

  try {
    const newSubCategory = new SubCategory({
      categoryID,
      name,
      description,
    });

    const category = await (await Category.findById(categoryID)).toObject();

    const categoryFields = {
      ...category,
      subcategories: [...category.subcategories, newSubCategory],
    };

    if (!category) {
      return res.status(400).json({ msg: "Category doesn't exist" });
    } else {
      await Category.findByIdAndUpdate(
        categoryID,
        { $set: categoryFields },
        { new: true }
      );
    }

    const subCategory = await newSubCategory.save();

    res.json(subCategory);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
