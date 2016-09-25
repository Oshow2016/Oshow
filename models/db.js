var mysql = require("mysql");

var db = mysql.createPool({
	host : "14.63.196.48",
	port : "3306",
	user : "root",
	password : "Rkakdqpfm!00",
	database : "oshow"
});

module.exports=db;
