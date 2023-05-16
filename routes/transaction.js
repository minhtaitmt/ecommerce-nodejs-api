const Transaction = require("../models/Transaction");
const Product = require("../models/Product");
const Customer = require("../models/Customer");
const nodemailer = require("nodemailer");
const {
	verifyToken,
	verifyTokenAndQLkho,
	verifyTokenAndCSKH,
	verifyTokenAndUser,
	verifyTokenCSKHAndQLkho,
} = require("./verifyToken");

const router = require("express").Router();

// CREATE
router.post("/", verifyTokenAndUser, async (req, res) => {
	const newTransaction = new Transaction(req.body);
	const customer = await Customer.findById(req.body.customerId);

	const date_ob = new Date();

	let transporter = nodemailer.createTransport({
		service: "gmail",
		auth: {
			user: "smiler170801@gmail.com",
			pass: process.env.EMAIL_PAS,
		},
	});
// Map và in ra sản phẩm trong chi tiết hóa đơn
	let orderList = await Promise.all(req.body.orders.map(async (order) => {
		var product = await Product.findById(order.productId)
		return "<p style=\"margin-left:100px\">Tên sản phẩm: <b>"+product.name + "</b> - Số lượng: <b>"+order.quantity+ "</b> - Đơn giá: <b>"+ product.price + "</b></p>";
	}));
	let orderListHtml = ""
	orderList.map(d =>{
		orderListHtml += d
	})


	const html = `<h2 style="text-align: center"><b>CHI TIẾT HÓA ĐƠN</b></h2>
					<p style="margin-left:50px">Đơn hàng được đặt vào: <b>${date_ob.getDate()}/${date_ob.getMonth()}/2022</b></p>
					<p style="margin-left:50px">Người đặt: <b>${customer.fullname}</b></p>
					<p style="margin-left:50px">Hình thức: <b>Online</b></p>
					<p style="margin-left:50px">Địa chỉ giao hàng: <b>${req.body.address}</b></p>
					<p style="margin-left:50px">Số điện thoại: <b>${req.body.phone}</b></p>
					<p style="margin-left:50px">Sản phẩm:</p>
					${orderListHtml}
					<p style="margin-left:50px">Giá chưa giảm: <b>$ ${req.body.subTotal}</b></p>
					<p style="margin-left:50px">Số tiền giảm: <b>$ -${req.body.discount}</b></p>
					<p style="margin-left:50px">Thành tiền: <b>$ ${req.body.total}</b></p>
					<p style="margin-left:50px">Trạng thái đơn hàng: <b>Cho xac nhan</b></p>
					<p style="margin-left:50px">Ghi chú: <b>${req.body.note ? req.body.note : "Không có ghi chú"}</b></p>
					<p style="margin-left:0px">Chúc quý khách một ngày tốt lành!<br>
					<p style="margin-left:0px">Regard.<p/>`;

	await transporter.sendMail(
		{
			from: "smiler170801@gmail.com",
			to: customer.email,
			subject: "Chi tiết hóa đơn mua hàng tại AUGUST!",
			text: "Chi tiết hóa đơn",
			html: html,
		},
		(error, info) => {
			if (error) {
				// console.log(error)
				// return res.status(500).json("Có lỗi xảy ra trong lúc gửi email!");
			}
		}
	);
	try {
		const savedTransaction = await newTransaction.save();
		return res.status(200).json(savedTransaction);
	} catch (err) {
		return res.status(500).json("Something went wrong while create transaction.");
	}
});

// UPDATE
router.put("/update/:id", verifyTokenAndCSKH, async (req, res) => {
	// Chú ý chỗ này
	if (req.body.delivery || req.body.status) {
		return res
			.status(403)
			.json(
				"Cannot update payment payment status or delivery status of transactions!"
			);
	}
	const trans = await Transaction.findById(req.params.id);
	if (trans.status === "hoan thanh") {
		return res
			.status(403)
			.json("Cannot update for completed transactions!");
	}
	try {
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			req.params.id,
			{
				$set: req.body,
			},
			{ new: true }
		);
		return res.status(200).json(updatedTransaction);
	} catch (err) {
		return res.status(500).json(err);
	}
});

// UPDATE DELIVERY
router.put("/update-status/:id", verifyTokenAndCSKH, async (req, res) => {
	// Chú ý chỗ này
	const trans = await Transaction.findById(req.params.id);
	const date_ob = new Date();

	if (req.body.status == "hoan thanh") {
		const customer = await Customer.findById(trans.customerId);

		let transporter = nodemailer.createTransport({
			service: "gmail",
			auth: {
				user: "smiler170801@gmail.com",
				pass: process.env.EMAIL_PAS,
			},
		});
// Map và in ra sản phẩm trong chi tiết hóa đơn
		let orderList = await Promise.all(trans.orders.map(async (order) => {
			var product = await Product.findById(order.productId)
			return "<p style=\"margin-left:100px\">Tên sản phẩm: <b>"+product.name + "</b> - Số lượng: <b>"+order.quantity + "</b>"+ "</b> - Đơn giá: <b>"+product.price + "</b></p>";
		}));
		let orderListHtml = ""
		orderList.map(d =>{
			orderListHtml += d
		})
		const d=new Date(trans.createdAt)


		const html = `<h4 style="margin-left:50px">Đơn hàng của bạn đã được giao thành công! Hãy kiểm tra lại một lần nữa thông tin đơn hàng nhé!</h4>
						<p style="margin-left:50px">Đơn hàng được đặt vào: <b>${d.toLocaleString()}</b></p>
						<p style="margin-left:50px">Người đặt: <b>${customer.fullname}</b></p>
						<p style="margin-left:50px">Hình thức: <b>Online</b></p>
						<p style="margin-left:50px">Địa chỉ giao hàng: <b>${trans.address}</b></p>
						<p style="margin-left:50px">Số điện thoại: <b>${trans.phone}</b></p>
						<p style="margin-left:50px">Sản phẩm:</p>
						${orderListHtml}
						<p style="margin-left:50px">Giá chưa giảm: <b>$ ${trans.subTotal}</b></p>
						<p style="margin-left:50px">Số tiền giảm: <b>$ -${trans.discount}</b></p>
						<p style="margin-left:50px">Thành tiền: <b>$ ${trans.total}</b></p>
						<p style="margin-left:50px">Trạng thái đơn hàng: <b>${trans.delivery}</b></p>
						<p style="margin-left:50px">Được giao vào ngày: <b>${date_ob.getDate()}/${date_ob.getMonth()}/${date_ob.getYear()}</b></p>
						<p style="margin-left:50px">Ghi chú: <b>${trans.note ? trans.note : "Không có ghi chú"}</b></p>
						<p style="margin-left:50px">Mọi đánh giá về đơn hàng vui lòng gửi <a href=${process.env.REACT_APP_BACKEND_URL + trans._id} >TẠI ĐÂY<a/></p><br>
						<p style="margin-left:0px">Cảm ơn vì đã chọn AUGUST! Chúc bạn một ngày tốt lành!<br>
						<p style="margin-left:0px">Regard.<p/>`;

		await transporter.sendMail(
			{
				from: "smiler170801@gmail.com",
				to: customer.email,
				subject: "Giao hàng thành công!",
				text: "Chi tiết hóa đơn",
				html: html,
			},
			(error, info) => {
				if (error) {
					// console.log(error)
					// return res.status(500).json("Có lỗi xảy ra trong lúc gửi email!");
				}
			}
		);
	}
	try {
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					delivery: req.body.delivery,
					status: req.body.status,
				},
			},
			{ new: true }
		);
		return res.status(200).json(updatedTransaction);
	} catch (err) {
		return res.status(500).json(err);
	}
});

// COMFIRM TRANSACTION
router.put("/confirm/:id", verifyTokenAndQLkho, async (req, res) => {
	const trans = await Transaction.findById(req.params.id);
	if (trans.delivery != "cho xac nhan") {
		return res.status(401).json("This transaction has been confirmed!");
	}
	try {
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					delivery: "cho lay hang",
				},
			},
			{ new: true }
		);
		return res.status(200).json("Successfully confirm!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

// DELETE
router.put("/cancel/:id", verifyTokenCSKHAndQLkho, async (req, res) => {
	// xem backup code
	const trans = await Transaction.findById(req.params.id);
	if (trans.status === "hoan thanh" || trans.delivery == "da giao") {
		return res.status(403).json("This transaction cannot be canceled because it is completed!");
	}
	try {
		const updatedTransaction = await Transaction.findByIdAndUpdate(
			req.params.id,
			{
				$set: {
					status: "da huy",
					delivery: "da huy",
					note: req.body.note,
				},
			},
			{ new: true }
		);
		return res.status(200).json("This transaction has been canceled!");
	} catch (err) {
		return res.status(500).json(err);
	}
});

// GET BY CUSTOMER ID
router.get("/find-by-userid/:customerId", verifyTokenAndCSKH, async (req, res) => {
	try {
		const transactions = await Transaction.find({
			customerId: req.params.customerId,
		});
		return res.status(200).json(transactions);
	} catch (err) {
		return res.status(500).json(err);
	}
});

// GET BY TRANS ID
router.get("/find-by-id/:id", verifyTokenAndCSKH, async (req, res) => {
	try {
		const transaction = await Transaction.findById(req.params.id);
		return res.status(200).json(transaction);
	} catch (err) {
		return res.status(500).json(err);
	}
});

// GET ALL
router.get("/", verifyTokenAndCSKH, async (req, res) => {
	try {
		const transactions = await Transaction.find();
		res.status(200).json(transactions);
	} catch (err) {
		res.status(500).json(err);
	}
});

//GET MONTHLY INCOME
router.get("/income", verifyTokenAndCSKH, async (req, res) => {
	const date = new Date();
	const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
	const previousMonth = new Date(
		new Date().setMonth(lastMonth.getMonth() - 1)
	);

	try {
		const income = await Transaction.aggregate([
			{
				$match: {
					createdAt: { $gte: previousMonth },
				},
			},
			{
				$project: {
					month: { $month: "$createdAt" },
					sales: "$total",
				},
			},
			{
				$group: {
					_id: "$month",
					total: { $sum: "$sales" },
				},
			},
		]);
		res.status(200).json(income);
	} catch (err) {
		res.status(500).json(err);
	}
});

module.exports = router;
