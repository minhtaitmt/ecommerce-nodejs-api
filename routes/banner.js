const Banner = require("../models/Banner");

const {
	verifyToken,
	verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// CREATE 
router.post("/", verifyTokenAndAdmin, async (req, res) => {
	
	const newBanner = new Banner(req.body);

	try {
		const savedBanner = await newBanner.save();
		res.status(200).json(savedBanner);
	} catch (err) {
		res.status(500).json(err);
	}
});

// UPDATE
router.put("/update/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const updatedBanner = await Banner.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		res.status(200).json(updatedBanner);
	} catch (err) {
		res.status(500).json(err);
	}
});

//DELETE
router.put("/delete/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const updatedBanner = await Banner.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false,
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedBanner);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET BANNER
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const banner = await Banner.findById(req.params.id);
		res.status(200).json(banner);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET ALL
router.get("/admin/", verifyTokenAndAdmin, async (req, res) => {
	try {
		const banners = await Banner.find();
		res.status(200).json(banners);
	} catch (err) {
		res.status(500).json(err);
	}
});

// CUSTOMER GET ALL
router.get("/", async (req, res) => {
	try {
		const banners = await Banner.find({active: true});
		res.status(200).json(banners);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;

