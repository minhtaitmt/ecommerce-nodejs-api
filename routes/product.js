const Product = require("../models/Product");
const {
	verifyToken,
	verifyTokenAndQLsanpham,
	verifyTokenAndQLkho,
} = require("./verifyToken");

const upload = require("../middleware/upload")

const router = require("express").Router();

// CREATE
router.post("/", upload.array("img", 10), verifyTokenAndQLsanpham, async (req, res) => {
	if(req.body.quantity){
		return res.status(403).json("Cannot create product with quantity!");
	}
	if(req.body.color){
		req.body.color = req.body.color.split(", ")
	}
	if(req.body.size){
		req.body.size = req.body.size.split(", ")
	}
	if(req.body.categories){
		req.body.categories = req.body.categories.split(", ")
	}
	const newProd = req.body
	newProd.img = []

	if(req.files.length > 0){
		for(let x = 0; x < req.files.length; x++){
			newProd.img[x] = req.files[x].path
		}
	}
	const newProduct = new Product(newProd);

	try {
		const savedProduct = await newProduct.save();
		return res.status(200).json(savedProduct);
	} catch (err) {
		res.status(500).json("Oops! Something went wrong while creating product.");
	}
});

// UPDATE 									// upload multiple files with number of files limitation is 10
router.put("/info/:id", upload.array("img", 10), verifyTokenAndQLsanpham, async (req, res) => {  
	if(req.body.quantity){
		return res.status(403).json("Cannot update product quantity!");
	}
	if(req.body.color){
		req.body.color = req.body.color.split(", ")
	}
	if(req.body.size){
		req.body.size = req.body.size.split(", ")
	}
	if(req.body.categories){
		req.body.categories = req.body.categories.split(", ")
	}

	const updateProd = req.body
	updateProd.img = []

	if(req.files.length > 0){
		for(let x = 0; x < req.files.length; x++){
			updateProd.img[x] = req.files[x].path
		}
	}
	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				$set: updateProd,
			},
			{ new: true }
		);
		res.status(200).json(updatedProduct);
	} catch (err) {
		res.status(500).json(err);
	}
});

// UPDATE QUANTITY
router.put("/quantity/:id", verifyTokenAndQLkho, async (req, res) => {

	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					quantity: req.body.quantity
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedProduct);
	} catch (err) {
		res.status(500).json(err);
	}
});

// DELETE
router.put("/delete/:id", verifyTokenAndQLsanpham, async (req, res) => {
	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false
				},
			},
			{ new: true }
		);
		res.status(200).json("Product has been deleted!");
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET
router.get("/find/:id", async (req, res) => {
	try {
		const product = await Product.findById(req.params.id);
		res.status(200).json(product);
	} catch (err) {
		res.status(500).json(err);
	}
});

// ADMIN GET ALL PRODUCT
router.get("/admin/", async (req, res) => {
	try {
		const products = await Product.find();
		res.status(200).json(products);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET ALL PRODUCT
router.get("/", async (req, res) => {
	const qNew = req.query.new;
	const qCategory = req.query.category;
	try {
		let products;

		if (qNew) {
			products = await Product.find().sort({ createdAt: -1 }).limit(1);
		} else if (qCategory) {
			products = await Product.find({
				categories: {
					$in: [qCategory],
				},
			});
		} else {
			products = await Product.find({active: true});
		}

		res.status(200).json(products);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
