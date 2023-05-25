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

module.exports = uploadCloud;