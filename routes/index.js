var express = require('express');
var router = express.Router();
var config = require ('../config/config')
var mysql = require('mysql')
var connection = mysql.createConnection(config);
connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', (req,res,next)=>{
	console.log(req.body)
	console.log("&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&")
	var name = req.body.name
	var email = req.body.email
	var password = req.body.password
	var insertQuery = `INSERT INTO user (name,email,password) VALUES (?,?,?)`
	connection.query(insertQuery,[name,email,password],(error,results)=>{
		if(error){
			throw error
		}else{
			res.json({
				name: name,
				msg: "loginSuccess"
			})
		}
	})
})

module.exports = router;
