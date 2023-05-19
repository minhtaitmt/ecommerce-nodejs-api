const path = require("path")
const multer = require("multer")


const storage = multer.diskStorage({
    destination: function(req, file, callback){
        callback(null, 'uploads/')
    },
    filename: function(req, file, callback){
        let ext = path.extname(file.originalname)
        callback(null, Date.now() + ext)
    }
})

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, callback){
        if(
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ){
            callback(null, true)
        } else{
            console.log("Only jpg & png file supported!")
            callback(null, false)
            const err = new Error('Only .png, .jpg and .jpeg format supported!')
            err.name = 'ExtensionError'
            return callback(err);
        }
    },
    limits: {
        fileSize: 1024 * 1024 * 2 // limit upload file 2 MB
    }
})

module.exports = upload