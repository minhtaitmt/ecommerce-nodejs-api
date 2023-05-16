const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const userRoute = require("./routes/user");
const authRoute = require("./routes/auth");
const adminRoute = require("./routes/admin");
const productRoute = require("./routes/product");
// const cartRoute = require("./routes/cart");
const transactionRoute = require("./routes/transaction");
const bannerRoute = require("./routes/banner");
const otpRoute = require("./routes/otp");
const categoryRoute = require("./routes/category");
const cors = require("cors")

dotenv.config();

mongoose
	.connect(process.env.MONGO_URL)
	.then(() => {console.log("DB connection successful!")})
	.catch((err) => {
		console.log(err);
	});


app.use(cors());
app.use(express.json());

app.use('/uploads', express.static('uploads'))

app.use("/api/user", userRoute)
app.use("/api/auth", authRoute);
app.use("/api/admin", adminRoute);
app.use("/api/product", productRoute);
// app.use("/api/cart", cartRoute);
app.use("/api/transaction", transactionRoute);
app.use("/api/banner", bannerRoute);
app.use("/api/category", categoryRoute);
app.use("/api/otp", otpRoute);


app.listen(process.env.PORT || 5000, () => {
	console.log("backend server is running!!");
});
