const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
	const authHeader = req.headers.token;
	if (authHeader) {
		const token = authHeader.split(" ")[1];
		jwt.verify(token, process.env.JWT_SEC, (err, user) => {
			if (err) {
				res.status(403).json("Token is not valid!");
			}
			req.user = user;
			next();
		});
	} else {
		return res.status(401).json("You are not authenticated!");
	}
};

// const authorization = (req, res, next) => {
// 	verifyToken(req, res, () => {
// 		if (req.user.id === req.params.id || req.user.isAdmin) {
// 			next();
// 		} else {
// 			res.status(403).json("You are not allowed to do that!");
// 		}
// 	});
// };

const verifyTokenAndUser = (req, res, next) => {
	verifyToken(req, res, () => {
		if (req.user.username) {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenAndAdmin = (req, res, next) => { // kiem tra nguoi dung hien tai co phai admin hay khong
	verifyToken(req, res, () => {
		if (req.user.role === "admin") {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenAndQLkho = (req, res, next) => { // kiem tra nguoi dung hien tai co phai quan ly kho hay khong
	verifyToken(req, res, () => {
		if (req.user.role === "qlkho" || req.user.role === "admin") {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenAndQLsanpham = (req, res, next) => { // kiem tra nguoi dung hien tai co phai quan ly san pham hay khong
	verifyToken(req, res, () => {
		if (req.user.role === "qlsanpham" || req.user.role === "admin") {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenAndCSKH = (req, res, next) => { // kiem tra nguoi dung hien tai co phai cham soc khach hang hay khong
	verifyToken(req, res, () => {
		if (req.user.role === "cskh" || req.user.role === "admin") {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenCSKHAndQLkho = (req, res, next) => { // xac thuc quan ly kho hoac admin hoac cham soc khach hang
	verifyToken(req, res, () => {
		if (req.user.role === "cskh" || req.user.role === "admin" || req.user.role === "qlkho") {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

const verifyTokenAndAdminAllRole = (req, res, next) => { // xac thuc user khong phai customer
	verifyToken(req, res, () => {
		if (req.user.role) {
			next();
		} else {
			res.status(403).json("You are not allowed to do that!");
		}
	});
};

module.exports = { verifyTokenAndAdmin, verifyTokenAndCSKH, verifyTokenAndQLsanpham, verifyTokenAndQLkho, verifyTokenAndUser, verifyToken, verifyTokenAndAdminAllRole, verifyTokenCSKHAndQLkho };
