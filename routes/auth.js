const router = require("express").Router();
const Admin = require("../models/Admin");
const Customer = require("../models/Customer");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const OtpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const { verifyTokenAndAdmin } = require("./verifyToken");
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

// ADMIN REGISTER
router.post("/admin-register", verifyTokenAndAdmin, async (req, res) => {
	// dùng otp generator để tạo một chuỗi otp 10 ký tự làm password
	const password = OtpGenerator.generate(10, {
		digits: true,
		lowerCaseAlphabets: true,
		upperCaseAlphabets: true,
		specialChars: false,
	});
	const admin = Admin.find({ id: req.body.id });
	if (admin) {
		return res.status(500).json("Id này đang được sử dụng!");
	}
	const newAdmin = new Admin({
		//rồi gửi email password về req.body.email
		id: req.body.id,
		fullname: req.body.fullname,
		phone: req.body.phone,
		gender: req.body.gender,
		address: req.body.address,
		birth: req.body.birth,
		email: req.body.email,
		role: req.body.role,
		password: CryptoJS.AES.encrypt(
			password,
			process.env.PASSWORD_SEC
		).toString(),
	});

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "smiler170801@gmail.com",
			pass: process.env.EMAIL_PAS,
		},
	});
	const html = `<p><b>Xin chào!</b> Chào mừng bạn đã trở thành một thành viên của hệ thống quản lý bán quần áo trực tuyến!</p>
					<p>Sau đây là tài khoản truy cập của bạn vừa được tạo bởi admin:</p>
					<p>Tên đăng nhập: <b>${req.body.id}</b></p>
					<p>Mật khẩu: <b>${password}</b></p>
					<p><b>Vui lòng không chia sẻ tài khoản truy cập hệ thống với bất kỳ ai! </b></p><br>
					<p>Regard.<p/>`;

	await transporter.sendMail(
		{
			from: "smiler170801@gmail.com",
			to: req.body.email,
			subject:
				"Tài khoản truy cập hệ thống quản lý bán quần áo trực tuyến!",
			text: password,
			html: html,
		},
		(error, info) => {
			if (error) {
				console.log(error);
				return res
					.status(500)
					.json("Có lỗi xảy ra trong lúc gửi email!");
			}
		}
	);
	try {
		const savedAdmin = await newAdmin.save();
		const { password, ...others } = savedAdmin._doc;
		res.status(201).json({ ...others });
		return;
	} catch (err) {
		res.status(500).json("Oops! Something went wrong...");
		return;
	}
});

// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
	try {
		const admin = await Admin.findOne({
			id: req.body.id,
		});
		if (!admin) {
			return res.status(401).json("Wrong username or password!");
		}

		const hashedPassword = CryptoJS.AES.decrypt(
			admin.password,
			process.env.PASSWORD_SEC
		);

		const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

		if (Originalpassword != req.body.password) {
			return res.status(401).json("Wrong username or password!");
		}

		const accessToken = jwt.sign(
			{
				id: admin.id,
				role: admin.role,
			},
			process.env.JWT_SEC,
			{ expiresIn: "1d" }
		);
		const { password, ...others } = admin._doc;
		return res.status(200).json({ ...others, accessToken });
	} catch (err) {
		return res.status(500).json(err);
	}
});

// CUSTOMER LOGIN
router.post("/customer-login", async (req, res) => {
	try {
		const customer = await Customer.findOne({
			username: req.body.username,
		});
		if (!customer) {
			res.status(401).json("Wrong username or password!");
			return;
		}

		const hashedPassword = CryptoJS.AES.decrypt(
			customer.password,
			process.env.PASSWORD_SEC
		);

		const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

		if (Originalpassword != req.body.password) {
			res.status(401).json("Wrong username or password!");
			return;
		}

		const accessToken = jwt.sign(
			{
				id: customer._id,
				username: customer.username,
			},
			process.env.JWT_SEC,
			{ expiresIn: "1d" }
		);
		const { password, ...others } = customer._doc;
		res.status(200).json({ ...others, accessToken });
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// CUSTOMER REGISTER
router.post("/customer-register", upload.array("avatar", 1), async (req, res) => {
	let form = {
		username: req.body.username,
		fullname: req.body.fullname,
		phone: req.body.phone,
		gender: req.body.gender,
		address: req.body.address,
		birth: req.body.birth,
		email: req.body.email,
		password: CryptoJS.AES.encrypt(
			// hash password
			req.body.password,
			process.env.PASSWORD_SEC
		).toString(),
		avatar: "",
	};
	

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
			form.avatar = uploadedUrls[0];
			try {
				console.log(form)
				const newCustomer = new Customer(form);
				const savedCustomer = await newCustomer.save();
				const { password, ...others } = savedCustomer._doc; //tra ve thong tin user ngoai tru password
				res.status(200).json({ ...others });
			} catch (err) {
				res.status(500).json(err);
			}
		})
		.catch((error) => {
			console.error(error);
		});

	
});

module.exports = router;
