module.exports = function(app){
  var express = require('express');
  var router = express.Router();
  var path = require('path');
  var jquery = require('jquery');
  var sql = "SELECT * from menu";
  var mysql      = require('mysql');
  var connection = mysql.createConnection({
    host : "14.63.196.48",
    port : "3306",
    user : "root",
    password : "Rkakdqpfm!00",
    database : "oshow"
  });
  connection.connect();

  var menu;
  var name;

  router.get('/search/:date/:index', function(req, res){
    var arr = new Array();
    var sql = "select * from reservation where reservation_date = '"+req.params.date+"';";

    connection.query(sql, function(err, rows, fields) {
      var arr = rows.slice((req.params.index-1)*7,req.params.index*7);
      res.send(arr);
    });
  });

  router.get('/save/:date/:arr', function(req, res){
    var sql;
    var arr = req.params.arr.split(',');

    for (var i=0;i<arr.length;i+=3) {
      sql = "update reservation set is_show = '"+arr[i+2]+"' where reservation_date = '"+req.params.date+"' and table_no = '"+arr[i]+"' and reservation_time = '"+arr[i+1]+"';";
      connection.query(sql);
    }
    res.send('');
  });

  router.get('/move', function(req, res){
    var length;
    var sql = "select * from reservation where reservation_date = '"+req.query.date+"'";

    connection.query(sql, function(err, rows, fields) {
        length = rows.length;
    });

    var sql = "SELECT * from reservation where reservation_date = '"+req.query.date+"' order by reservation_time limit 7;";
    connection.query(sql, function(err, rows, fields) {
      rows.push(length);
      res.send(rows);
    });
  });

  router.get('/specific/:time/:no', function(req, res){
    var sql = "SELECT * from reservation_menu where reservation_no = '"+req.params.no+"';";
    connection.query(sql, function(err, rows, fields) {
      menu = rows[0].menu_name;
      console.log(menu);
    });

    sql = "select customer_name from customers where customer_id = (SELECT customer_id from reservation where reservation_no = '"+req.params.no+"');";
    connection.query(sql, function(err, rows, fields) {
      name = rows[0].customer_name;
      console.log(name);
    });

    sql = "SELECT * from reservation where reservation_no = '"+req.params.no+"';";
    connection.query(sql, function(err, rows, fields) {
      while (true) {
        if(menu.length!=0&&name.length!=0){
          rows.push(menu);
          rows.push(name);
          break;
        }
      }
      res.render('specific_menu',{rows:rows});
    });
  });



  router.get('/', function(req, res){
    var length;
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth() + 1;
    if (month < 10) { month = '0' + month; }
    var year = d.getFullYear();
    var date = year.toString()+"-"+month.toString()+"-"+day.toString();

    var sql = "select * from reservation where reservation_date = '"+date+"';";
    connection.query(sql, function(err, rows, fields) {
      length = rows.length;
    });

    sql = "SELECT * from reservation where reservation_date = '"+date+"' order by reservation_time limit 7;";

    connection.query(sql, function(err, rows, fields) {
        rows.push(length);
        res.render('ow_main',{rows:rows, message:req.flash('authMessage'), user:req.user});
    });
  });

  return router;
}
