var express = require('express');
var router = express.Router();
var config = require ('../config/config')
var mysql = require('mysql')
var bcrypt = require ('bcrypt-nodejs')
var randToken = require('rand-token')
var connection = mysql.createConnection(config);
connection.connect();

// dependencies for image upload
var aws = require('aws-sdk');
var fs = require('fs');
var multerS3 = require('multer-s3');
var multer = require('multer');

// Tell multer where to save the files it gets
var uploadDir = multer({
	dest: 'public/images'
});

aws.config.loadFromPath('./config/config.json');
aws.config.update({
	signatureVersion: 'v4'
});
var s0 = new aws.S3({});

var upload = multer({
	storage: multerS3({
		s3: s0,
		bucket: 'tracker-app-photo-bucket',
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		metadata: (req, file, cb) => {
			cb(null, { fieldName: file.fieldname });
		},
		key: (req, file, cb) => {
			cb(null, Date.now() + file.originalname)
		}
	})
});

// Specify the name of the file input to accept
var nameOfFileField = uploadDir.single('imageToUpload');

// photo upload
router.post('/photoUpload', upload.any(), (req,res)=>{
	var info = req.files;
	// url gets stored in database
	var insertUrl = `INSERT INTO images (id, url) VALUES (?, ?, ?);`;
	info.map((image) => {
		connection.query(insertUrl, [userId, image.location], (error, results) => {
			if (error) {
				throw error;
			}
		});
		res.json({
			msg: 'imageUploaded',
			imageUrl: image.location
		});
	});
});

router.post('/signup', (req,res,next)=>{
	var name = req.body.name
	var email = req.body.email
	var password = req.body.password
	var hash = bcrypt.hashSync(password)
	const token = randToken.uid(60);
	var selectQuery = `SELECT * from user WHERE email = ?;`;
	connection.query(selectQuery,[email],(error,results)=>{
		if(error){
			throw error;
		} else if (results.length > 0) {
			res.json({
				msg: "emailTaken"
			})
		} else {
			var insertQuery = `INSERT INTO user (name,email,password,token) VALUES (?,?,?,?);`;
			connection.query(insertQuery, [name, email, hash, token], (error, results) => {
				if (error) {
					throw error
				} else {
					res.json({
						token: token,
						name: name,
						msg: "loginSuccess"
					})
				}
			})
		}
	})	
})

router.post('/login', (req, res, next) => {
	var email = req.body.email
	// case for when password is undefined
	if (req.body.password !== undefined){
		var password = req.body.password;
	} else {
		var password = '';
	}
	var selectQuery = 'SELECT * FROM user WHERE email = ?;';
	connection.query(selectQuery, [email], (error, results) => {
		if (error) {
			throw error
		} else {
			// handle user does not exist
			if (results.length == 0) {
				// send user to signup
				res.json({
					msg: 'userDoesNotExist',
				})
			} else {
				var passwordMatch = bcrypt.compareSync(password, results[0].password)
				console.log(passwordMatch)
				// handle password match
				if (passwordMatch) {
					// session?
					// send them map
					res.json({
						msg: 'userFound',
						userInfo: results[0]
					})
				// handle password does not match
				} else {
					// tell user password does not match
					res.json({
						msg: 'wrongPassword',
					})
				}
			}
		}
	})
});

router.post('/timer',function(req,res,next){
	console.log(req.body)
	var minutes = req.body.timerMinutes
	var seconds = req.body.timerSeconds
	var distance = req.body.distance
	var insertQuery = `INSERT INTO time (minutes, seconds, distance) VALUES (?,?,?)`
	connection.query(insertQuery,[minutes, seconds, distance],(error,results)=>{
		if(error){
			throw error
		}else{
			res.json({
				minutes: minutes,
				seconds: seconds,
				distance: distance
			})
		}
	})
})

module.exports = router;
