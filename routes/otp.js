const Otp = require("../models/Otp");
const CryptoJS = require("crypto-js");
const OtpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");

const router = require("express").Router();

// Create otp
router.post("/", async (req, res) => {

	const otpList = await Otp.find({
		email: req.body.email,
	});
	if (!otpList.length) {
		const otp = OtpGenerator.generate(6, {
			digits: true,
			lowerCaseAlphabets: false,
			upperCaseAlphabets: false,
			specialChars: false,
		});
		const hashedOtp = CryptoJS.AES.encrypt(
			otp,
			process.env.PASSWORD_SEC
		).toString();
		const newOtp = new Otp({
			otp: hashedOtp,
			email: req.body.email,
		});
	
		// send mail
		let transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "smiler170801@gmail.com",
				pass: process.env.EMAIL_PAS,
			},
		});
		const html = `<p><b>Xin chào!</b> Đây là thông báo đính kèm mã OTP để xác thực email của bạn tại hệ thống <b>AUGUST</b>!</p>
						<p>Sau đây là mã OTP của bạn vừa được tạo:</p>
						<p>Mã OTP: <b>${otp}</b></p>
						<p><b>Mã OTP này sẽ có hiệu lực trong vòng ba phút! </b></p><br>
						<p>Regard.<p/>`
	
		await transporter.sendMail(
			{
				from: "smiler170801@gmail.com",
				to: req.body.email,
				subject: "Mã xác thực OTP!",
				text: otp,
				html: html,
			},
			(err) => {
				if (err) {
					return res
						.status(500)
						.json("Something went wrong while sending email!");
				}
			}
		);
		try {
			
			const savedOtp = await newOtp.save();
			res.status(201).json("Please check your email!");
			return;
		} catch (err) {
			res.status(500).json("Oops! Something went wrong...");
			return;
		}
	}
	const lastOtp = otpList[otpList.length - 1];
	const hashedOtp = CryptoJS.AES.decrypt(
		lastOtp.otp,
		process.env.PASSWORD_SEC
	);

	const originalOtp = hashedOtp.toString(CryptoJS.enc.Utf8);

    // send mail
	let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "smiler170801@gmail.com",
            pass: process.env.EMAIL_PAS,
        },
    });
    const html = `<p><b>Xin chào!</b> Đây là thông báo đính kèm mã OTP để xác thực email của bạn tại hệ thống <b>AUGUST</b>!</p>
                    <p>Sau đây là mã OTP của bạn vừa được tạo:</p>
                    <p>Mã OTP: <b>${originalOtp}</b></p>
                    <p><b>Mã OTP này sẽ có hiệu lực trong vòng ba phút! </b></p><br>
                    <p>Regard.<p/>`

    await transporter.sendMail(
        {
            from: "smiler170801@gmail.com",
            to: req.body.email,
            subject: "Mã xác thực OTP!",
            text: originalOtp,
            html: html,
        },
        (err, info) => {
            if (err) {
                return res
                    .status(500)
                    .json("Something went wrong while sending email!");
            }
        }
    );
    return res.status(201).json("Please check your email!");
});

//Check otp
router.post("/check-otp", async (req, res) => {
	const otpList = await Otp.find({
		email: req.body.email,
	});
	if (!otpList.length) {
		res.status(401).json("Otp code expired!");
		return;
	}
	const lastOtp = otpList[otpList.length - 1];
	const hashedOtp = CryptoJS.AES.decrypt(
		lastOtp.otp,
		process.env.PASSWORD_SEC
	);

	const originalOtp = hashedOtp.toString(CryptoJS.enc.Utf8);

	if (originalOtp != req.body.otp) {
		res.status(401).json("Otp is not valid!");
		return;
	}

	// hậu xử lý ở đây
	res.status(200).json("Successfully verify otp!");
	return;
});

module.exports = router;