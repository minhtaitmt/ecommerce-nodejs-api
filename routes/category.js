const Category = require("../models/Category");

const {
	verifyToken,
	verifyTokenAndQLsanpham,
} = require("./verifyToken");

const router = require("express").Router();

// CREATE 
router.post("/", verifyTokenAndQLsanpham, async (req, res) => {
	
	const newCategory = new Category(req.body);

	try {
		const savedCategory = await newCategory.save();
		res.status(200).json(savedCategory);
	} catch (err) {
		res.status(500).json(err);
	}
});

// UPDATE
router.put("/update/:id", verifyTokenAndQLsanpham, async (req, res) => {
	try {
		const updatedCategory = await Category.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		res.status(200).json(updatedCategory);
	} catch (err) {
		res.status(500).json(err);
	}
});

//DELETE
router.put("/delete/:id", verifyTokenAndQLsanpham, async (req, res) => {
	try {
		const updatedCategory = await Category.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false,
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedCategory);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET CATEGORY
router.get("/find/:id", verifyTokenAndQLsanpham, async (req, res) => {
	try {
		const category = await Category.findById(req.params.id);
		res.status(200).json(category);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET ALL
router.get("/admin", verifyTokenAndQLsanpham, async (req, res) => {
	try {
		const categories = await Category.find();
		res.status(200).json(categories);
	} catch (err) {
		res.status(500).json(err);
	}
});

// CUSTOMER GET ALL
router.get("/", async (req, res) => {
	try {
		const categories = await Category.find({active: true});
		res.status(200).json(categories);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;

