const Customer = require("../models/Customer");
const CryptoJS = require("crypto-js");
const OtpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const upload = require("../middleware/upload");
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

const { verifyTokenAndCSKH, verifyTokenAndUser } = require("./verifyToken");

const router = require("express").Router();

// ADMIN UPDATE
router.put("/admin-update/:id", verifyTokenAndCSKH, async (req, res) => {
	if (req.body.username || req.body.password) {
		res.status(500).json("Cannot update username and password of customer");
		return;
	}
	try {
		const updatedCustomer = await Customer.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		const { password, ...others } = updatedCustomer._doc;
		res.status(200).json({ ...others });
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// CUSTOMER UPDATE
router.put(
	"/update/:id",
	upload.array("avatar", 1),
	verifyTokenAndUser,
	async (req, res) => {
		if (req.body.username || req.body.password) {
			res.status(500).json(
				"Cannot update username or password: Do not try to update your username or password!"
			);
			return;
		}
		let newCustomer = {
			fullname: req.body.fullname,
			phone: req.body.phone,
			gender: req.body.gender,
			address: req.body.address,
			birth: req.body.birth,
		};
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
					newCustomer.avatar = uploadedUrls[0];

					try {
						const updatedCustomer =
							await Customer.findByIdAndUpdate(
								req.params.id,
								{
									$set: newCustomer,
								},
								{ new: true }
							);
						const { password, ...others } =
							updatedCustomer._doc; // tra ve thong tin user ngoai tru password
						res.status(200).json(others);
						return;
					} catch (err) {
						res.status(500).json(
							"Something went wrong while updating information."
						);
						return;
					}
				})
				.catch((error) => {
					console.error(error);
				});
		} else {
			try {
				const updatedCustomer =
					await Customer.findByIdAndUpdate(
						req.params.id,
						{
							$set: newCustomer,
						},
						{ new: true }
					);
				const { password, ...others } =
					updatedCustomer._doc; // tra ve thong tin user ngoai tru password
				res.status(200).json(others);
				return;
			} catch (err) {
				res.status(500).json(
					"Something went wrong while updating information."
				);
				return;
			}
		}
	}
);

// RESET PASSWORD
router.put("/reset-password", verifyTokenAndUser, async (req, res) => {
	const customer = await Customer.findOne({
		username: req.body.username,
	});
	if (!customer) {
		return res.status(401).json("Cannot find any user with this username!");
	}
	const password = OtpGenerator.generate(10, {
		// tao ra chuoi 10 ky tu lam password tam thoi va gui vao email user
		digits: true,
		lowerCaseAlphabets: true,
		upperCaseAlphabets: true,
		specialChars: false,
	});
	const hashed_password = CryptoJS.AES.encrypt(
		password,
		process.env.PASSWORD_SEC
	).toString();

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "smiler170801@gmail.com",
			pass: process.env.EMAIL_PAS,
		},
	});
	const html = `<p><b>Xin chào!</b> Đây là email thông báo bảo mật tài khoản từ hệ thống bán quần áo trực tuyến <b>AUGUST</b>!</p>
					<p>Sau đây là tài khoản đăng nhập với mật khẩu mới của bạn vừa được tạo:</p>
					<p>Tên đăng nhập: <b>${req.body.username}</b></p>
					<p>Mật khẩu: <b>${password}</b></p>
					<p><b>Vui lòng thay đổi mật khẩu ngay sau khi bạn đăng nhập lại vào hệ thống! </b></p><br>
					<p>Regard.<p/>`;

	await transporter.sendMail(
		{
			from: "smiler170801@gmail.com",
			to: customer.email,
			subject:
				"Tài khoản truy cập hệ thống bán quần áo trực tuyến AUGUST!",
			text: password,
			html: html,
		},
		(err) => {
			if (err) {
				return res
					.status(500)
					.json("Có lỗi xảy ra trong lúc gửi email!");
			}
		}
	);

	try {
		const updatedCustomer = await Customer.findOneAndUpdate(
			{ username: req.body.username },
			{
				$set: {
					password: hashed_password,
					isFirst: true,
				},
			},
			{ new: true }
		);

		const { password, ...others } = updatedCustomer._doc;
		res.status(200).json("Please check your email!");
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// CHANGE PASSWORD
router.put("/change-password", verifyTokenAndUser, async (req, res) => {
	const customer = await Customer.findById(req.body.customerId);
	if (!customer) {
		return res.status(401).json("Cannot find any user with this id!");
	}
	const hashedPassword = CryptoJS.AES.decrypt(
		customer.password,
		process.env.PASSWORD_SEC
	);

	const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

	if (Originalpassword != req.body.password) {
		return res.status(401).json("Wrong password. Please try again!");
	}

	try {
		const updatedCustomer = await Customer.findByIdAndUpdate(
			req.body.customerId,
			{
				$set: {
					password: CryptoJS.AES.encrypt(
						req.body.newPassword,
						process.env.PASSWORD_SEC
					).toString(),
					isFirst: false,
				},
			},
			{ new: true }
		);

		res.status(200).json("Successfully change password!");
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// DELETE
router.put("/delete/:id", verifyTokenAndCSKH, async (req, res) => {
	try {
		const updatedCustomer = await Customer.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false,
				},
			},
			{ new: true }
		);
		const { password, ...others } = updatedCustomer._doc;
		res.status(200).json({ ...others });
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// GET
router.get("/find/:id", verifyTokenAndCSKH, async (req, res) => {
	try {
		const customer = await Customer.findById(req.params.id);
		const { password, ...others } = customer._doc;
		res.status(200).json({ ...others });
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET ALL USERs
router.get("/", verifyTokenAndCSKH, async (req, res) => {
	const query = req.query.new;
	try {
		const customers = query
			? await Customer.find().sort({ _id: -1 }).limit(5)
			: await Customer.find();
		let result = [];
		customers.map((data) => {
			const { password, ...others } = data._doc;
			result.push({ ...others });
		});
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET USER STATS
router.get("/stats", verifyTokenAndCSKH, async (req, res) => {
	const date = new Date();
	const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

	try {
		const data = await Customer.aggregate([
			{ $match: { createdAt: { $gte: lastYear } } },
			{
				$project: {
					month: { $month: "$createdAt" },
				},
			},
			{
				$group: {
					_id: "$month",
					total: { $sum: 1 },
				},
			},
		]);
		res.status(200).json(data);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
