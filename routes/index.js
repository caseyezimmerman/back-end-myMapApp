var express = require('express');
var router = express.Router();
var config = require ('../config/config')
var mysql = require('mysql')
var bcrypt = require ('bcrypt-nodejs')
var randToken = require('rand-token')
var connection = mysql.createConnection(config);
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/signup', (req,res,next)=>{
	console.log(req.body)
	console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
	var name = req.body.name
	var email = req.body.email
	var password = req.body.password
	var hash = bcrypt.hashSync(password)
	const token = randToken.uid(60);
	var insertQuery = `INSERT INTO user (name,email,password,token) VALUES (?,?,?,?)`
	connection.query(insertQuery,[name,email,hash, token],(error,results)=>{
		if(error){
			throw error
		}else{
			res.json({
				token: token,
				name: name,
				msg: "loginSuccess"
			})
		}
	})
})

router.post('/map',function(req,res,next){
	console.log(req.body)
	var location = JSON.stringify(req.body.location)
	var distance = req.body.distance
	var insertQuery = `INSERT INTO info (location, distance) VALUES (?,?)`
	connection.query(insertQuery,[location, distance],(error,results)=>{
		if(error){
			throw error
		}else{
			res.json({
				location: location,
				distance: distance
			})
		}
	})
})

module.exports = router;
