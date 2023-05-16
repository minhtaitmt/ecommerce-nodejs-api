const Cart = require("../models/Cart");
const {
	verifyToken,
	verifyTokenAndUser,
	verifyTokenAndCSKH,
} = require("./verifyToken");

const router = require("express").Router();

//CREATE
router.post("/", verifyTokenAndUser, async (req, res) => {
	const cart = Cart.findOne({userId: req.body.userId});
	if (cart && cart.active) {
		return res
			.status(403)
			.json("Cannot create a new cart! You already have a cart!");
	}
	const newCart = new Cart(req.body);

	try {
		const savedCart = await newCart.save();
		res.status(200).json(savedCart);
	} catch (err) {
		res.status(500).json(err);
	}
});

// UPDATE
router.put("/update/:id", verifyTokenAndUser, async (req, res) => {
	try {
		const updatedCart = await Cart.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					orders: req.body.orders,
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedCart);
	} catch (err) {
		res.status(500).json(err);
	}
});

//DELETE
router.put("/delete/:id", verifyTokenAndUser, async (req, res) => {
	try {
		const updatedCart = await Cart.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false,
				},
			},
			{ new: true }
		);
		res.status(200).json(updatedCart);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET USER CART
router.get("/find/:userId", verifyTokenAndCSKH, async (req, res) => {
	try {
		const cart = await Cart.findOne({ userId: req.params.userId });
		res.status(200).json(cart);
	} catch (err) {
		res.status(500).json(err);
	}
});

// //GET ALL
router.get("/", verifyTokenAndCSKH, async (req, res) => {
	try {
		const carts = await Cart.find();
		res.status(200).json(carts);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
