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
    var sql = "SELECT * from restaurant where restaurant_address = '"+req.params.res_addr+"' and restaurant_name = '"+req.params.res_name+"';";
  console.log(req.params.res_addr);
  console.log(req.params.res_name);
    readData(sql,function(row){
      var sql = "SELECT * from menu where restaurant_no = '"+row[0].restaurant_no+"';";
      connection.query(sql, function(err, rows, fields) {
        rows.push(req.params.res_name+"*"+req.params.res_addr);
        rows.push(row[0].restaurant_tel);
        rows.push(row[0].restaurant_opening_time);
        rows.push(row[0].restaurant_closing_time);
        rows.push(row[0].restaurant_introduce);
        rows.push(row[0].restaurant_no);
        res.render('window',{user:req.user, rows:rows});
      });
    });
  });

  function readData(sql,callback){
    connection.query(sql, function(err, rows, fields) {

      callback(rows);
    });
  }

  router.get('/search/:key1/:key2/:index', function(req, res){
    var index = (req.params.index-1)*4;

    if(req.params.key1=="region")
      var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_address like '%"+req.params.key2+"%';";
    else
      var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_name like '%"+req.params.key2+"%';";

    connection.query(sql, function(err, rows, fields) {
          if(err){
            console.log(err);
          }else{
            var result = [];
            for (var i = index; i < index+4; i++) {
              result.push(rows[i]);
              if (i+1==rows.length) {
                break;
              }
            }
            res.send(result);
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
                  +req.query.search+"%' limit 4";
      else if(req.query.radio=="shop")
        var sql = "SELECT restaurant_name,restaurant_address from restaurant where restaurant_name like '%"
                  +req.query.search+"%' limit 4";

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
