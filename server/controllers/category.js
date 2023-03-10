const Category = require("../models/category");
const slugify = require("slugify");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    let category = await new Category({ name, slug: slugify(name) }).save();
    res.json(category);
  } catch (error) {
    res.status(400).send("Create category failed");
  }
};

//sort according to latest
exports.list = async (req, res) => {
  let categories = await Category.find({}).sort({ createdAt: -1 }).exec();
  res.json(categories);
};

exports.read = async (req, res) => {
  let category = await Category.findOne({ slug: req.params.slug }).exec();
  res.json(category);
};

exports.update = async (req, res) => {
  const { name } = req.body;

  try {
    const updated = await Category.findOneAndUpdate(
      { slug: req.params.slug },
      { name, slug: slugify(name) },
      { new: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(400).send("Category update failed");
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await Category.findOneAndDelete({ slug: req.params.slug });
    res.json(deleted);
  } catch (error) {
    res.status(400).send("Category delete failed");
  }
};
