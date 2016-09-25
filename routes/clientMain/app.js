module.exports = function(app){
  var express = require('express');
  var router = express.Router();
  var path = require('path');
  var jquery = require('jquery');
  var mysql      = require('mysql');

  var connection = mysql.createConnection({
    host : "14.63.196.48",
      port : "3306",
      user : "root",
      password : "Rkakdqpfm!00",
      database : "oshow"
  });
  connection.connect();

  router.get('/:res_name/:res_addr', function(req, res){
    var restaurant_no;
    var sql = "SELECT restaurant_no from restaurant where restaurant_address like '%"+req.params.res_addr+"%' and restaurant_name like '%"+req.params.res_name+"%'";
        connection.query(sql, function(err, rows, fields) {
          restaurant_no = rows[0].restaurant_no;
        });

    var description;
    console.log(req.params.res_name);
    console.log(req.params.res_addr);
    // res.sendFile(path.join(__dirname,'/public/enter_key.png'));
    var sql = "SELECT * from menu";
    connection.query(sql, function(err, rows, fields) {
      rows.push(restaurant_no);
      res.render('window',{user:req.user, rows:rows});

    });
  });

  router.get('/search/:key1/:key2/:index', function(req, res){
    var index = (req.params.index-1)*5;

    if(req.params.key1=="region")
      var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_address like '%"+req.params.key2+"%' and restaurant_no > "+index+" limit 5;";
    else
      var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_name like '%"+req.params.key1+"%' and restaurant_no > "+index+" limit 5;";

    connection.query(sql, function(err, rows, fields) {
          if(err){
            console.log(err);
          }else{
            res.send(rows);
          }
      });
  });

  router.get('/search', function(req, res){
      var length;

      if(req.query.radio=="region")
        var sql = "SELECT * from restaurant where restaurant_address like '%"+req.query.search+"%'";
      else if(req.query.radio=="shop")
        var sql = "SELECT * from restaurant where restaurant_name like '%"+req.query.search+"%'";
      else
        var sql = "SELECT restaurant_address,restaurant_name from restaurant where restaurant_name like '%"+req.query.search+"%'";

      connection.query(sql, function(err, rows, fields) {
        length = rows.length;
      });

      if(req.query.radio=="region")
        var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_address like '%"
                  +req.query.search+"%' limit 5";
      else if(req.query.radio=="shop")
      var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_name like '%"
                +req.query.search+"%' limit 5";

      connection.query(sql, function(err, rows, fields) {
        rows.push(length);
        res.send(rows);
      });
  });

  router.get('/', function(req, res){
      res.render('cl_main',{
           message: req.flash('authMessage'),
           user : req.user // get the user out of session and pass to template
      });
  });
  return router;
}
