const Admin = require("../models/Admin");
const CryptoJS = require("crypto-js");
const OtpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const {
    verifyTokenAndAdminAllRole,
	verifyTokenAndAdmin,
} = require("./verifyToken");

const router = require("express").Router();

// ADMIN UPDATE
router.put("/admin-update/:id", verifyTokenAndAdmin, async (req, res) => {
	if(req.body.id || req.body.password){
		res.status(403).json("Cannot update id and password of admin");
		return;
	}
	try {
		const updatedAdmin = await Admin.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		const { password, ...others } = updatedAdmin._doc;
		res.status(200).json({...others});
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// ADMIN SELF UPDATE
router.put("/update/:id", verifyTokenAndAdminAllRole, async (req, res) => {
	if (req.body.password) {
		req.body.password = CryptoJS.AES.encrypt(
			req.body.password,
			process.env.PASSWORD_SEC
		).toString();
	}
	if(req.body.id){
		res.status(500).json("Cannot update id: Do not try to update your id!");
		return;
	}
	try {
		const updatedAdmin = await Admin.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		const { password, ...others } = updatedAdmin._doc;
		res.status(200).json({...others});
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// RESET PASSWORD
router.put("/reset-password", verifyTokenAndAdmin, async (req, res) => {
	const admin = await Admin.findById(req.body.id);
	if(!admin){
		return res.status(401).json("Cannot find any user with this id!");
	}
	const password = OtpGenerator.generate(10, { // generate a random password and send to user's email
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
					<p>Tên đăng nhập: <b>${admin.id}</b></p>
					<p>Mật khẩu: <b>${password}</b></p>
					<p><b>Vui lòng thay đổi mật khẩu ngay sau khi bạn đăng nhập lại vào hệ thống! </b></p><br>
					<p>Regard.<p/>`

	await transporter.sendMail(
		{
			from: "smiler170801@gmail.com",
			to: admin.email,
			subject: "Tài khoản truy cập hệ thống bán quần áo trực tuyến AUGUST!",
			text: password,
			html: html,
		},
		(err) => {
			if (err) {
				return res
					.status(500)
					.json("There's something wrong when sending email!");
				
			}

		}
	);

	try {
		const updatedAdmin = await Admin.findByIdAndUpdate(
			req.body.id,
			{
				$set: {
					password: hashed_password,
					isFirst: true,
				},
			},
			{ new: true }
		);
		const { password, ...others } = updatedAdmin._doc;
		res.status(200).json("Successfully reset password!");
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// CHANGE PASSWORD
router.put("/change-password", verifyTokenAndAdminAllRole, async (req, res) => {

	const admin = await Admin.findById(req.body.id);
	if(!admin){
		return res.status(401).json("Cannot find any user with this id!");
	}
	const hashedPassword = CryptoJS.AES.decrypt(
		admin.password,
		process.env.PASSWORD_SEC
	);
	console.log(admin.password)

	const Originalpassword = hashedPassword.toString(CryptoJS.enc.Utf8);

	if(Originalpassword != req.body.password){
		return res.status(401).json("Wrong password. Please try again!");
	}


	try {
		const updatedAdmin = await Admin.findByIdAndUpdate(
			req.body.id,
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
		const { password, ...others } = updatedAdmin._doc;
		res.status(200).json({...others});
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// DELETE ADMIN
router.put("/delete/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const updatedAdmin = await Admin.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					active: false,
				},
			},
			{ new: true }
		);
		const { password, ...others } = updatedAdmin._doc;
		res.status(200).json({...others});
		return;
	} catch (err) {
		res.status(500).json(err);
		return;
	}
});

// GET ADMIN INFO
router.get("/find/:id", verifyTokenAndAdmin, async (req, res) => {
	try {
		const admin = await Admin.findById(req.params.id);
		const { password, ...others } = admin._doc;
		res.status(200).json({ ...others });
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET ALL ADMINs
router.get("/", verifyTokenAndAdmin, async (req, res) => {
	const query = req.query.new;
	try {
		const admins = query
			? await Admin.find().sort({ _id: -1 }).limit(5)
			: await Admin.find();
        let result = []
        admins.map(data =>{
            const {password, ...others} = data._doc;
            result.push({...others})
        })
		res.status(200).json(result);
	} catch (err) {
		res.status(500).json(err);
	}
});

// GET USER STATS
router.get("/stats", verifyTokenAndAdmin, async (req, res) => {
	const date = new Date();
	const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

	try {
		const data = await Admin.aggregate([
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
