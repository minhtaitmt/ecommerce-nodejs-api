const Product = require("../models/Product");
const {
	verifyToken,
	verifyTokenAndQLsanpham,
	verifyTokenAndQLkho,
} = require("./verifyToken");

const upload = require("../middleware/upload");

const router = require("express").Router();

const cloudinary = require("../config/cloudinary");
let streamifier = require("streamifier");

const uploadCloud = (buffer, callback) => {
	let cld_upload_stream = cloudinary.uploader.upload_stream(
		{
			folder: "ecommerce_nodejs",
		},
		async function (error, result) {
			callback(error, result);
		}
	);

	streamifier.createReadStream(buffer).pipe(cld_upload_stream);
};

// CREATE
router.post(
	"/",
	verifyTokenAndQLsanpham,
	upload.array("img", 10),
	async (req, res) => {
		if (req.body.color) {
			req.body.color = req.body.color.split(", ");
		}
		if (req.body.size) {
			req.body.size = req.body.size.split(", ");
		}
		if (req.body.categories) {
			req.body.categories = req.body.categories.split(", ");
		}

		const newProd = req.body;
		newProd.img = [];

		if (req.files.length > 0) {
			const uploadPromises = req.files.map((file) => {
				return new Promise((resolve, reject) => {
					uploadCloud(file.buffer, (error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result.url);
						}
					});
				});
			});

			Promise.all(uploadPromises)
				.then(async (uploadedUrls) => {
					newProd.img = uploadedUrls;
					const newProduct = new Product(newProd);
					try {
						const savedProduct = await newProduct.save();
						return res.status(200).json(savedProduct);
					} catch (err) {
						res.status(500).json(
							"Oops! Something went wrong while creating product."
						);
					}
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			const newProduct = new Product(newProd);
			try {
				const savedProduct = await newProduct.save();
				return res.status(200).json(savedProduct);
			} catch (err) {
				res.status(500).json(
					"Oops! Something went wrong while creating product."
				);
			}
		}
	}
);

// UPDATE 									// upload multiple files with number of files limitation is 10
router.put(
	"/info/:id",
	upload.array("img", 10),
	verifyTokenAndQLsanpham,
	async (req, res) => {
		if (req.body.quantity) {
			return res.status(403).json("Cannot update product quantity!");
		}
		if (req.body.color) {
			req.body.color = req.body.color.split(", ");
		}
		if (req.body.size) {
			req.body.size = req.body.size.split(", ");
		}
		if (req.body.categories) {
			req.body.categories = req.body.categories.split(", ");
		}

		const updateProd = req.body;
		updateProd.img = [];

		if (req.files.length > 0) {
			const uploadPromises = req.files.map((file) => {
				return new Promise((resolve, reject) => {
					uploadCloud(file.buffer, (error, result) => {
						if (error) {
							reject(error);
						} else {
							resolve(result.url);
						}
					});
				});
			});

			Promise.all(uploadPromises)
				.then(async (uploadedUrls) => {
					updateProd.img = uploadedUrls;
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
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
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
		}
		
	}
);

// UPDATE QUANTITY
router.put("/quantity/:id", verifyTokenAndQLkho, async (req, res) => {
	try {
		const updatedProduct = await Product.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					quantity: req.body.quantity,
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
router.put("/delete/:id", verifyTokenAndQLsanpham, (req, res) => {
	try {
		Product.findByIdAndDelete({
			_id: req.params.id,
		})
			.then((result) => {
				if (!result.value || result.deletedCount <= 0) {
					res.status(200).json("Product was deleted!");
				} else {
					res.status(200).json("Product has been deleted!");
				}
			})
			.catch((error) => {
				console.error("Failed to delete product", error);
				res.status(500).json({ error: "Failed to delete product" });
			});
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
			products = await Product.find({ active: true });
		}

		res.status(200).json(products);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
