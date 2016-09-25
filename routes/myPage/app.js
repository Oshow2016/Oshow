module.exports = function(){
  var express = require('express');
  var router = express.Router();
  var async = require('async');
  var moment = require('moment');
  var mysql = require("mysql");

  var crypto = require('crypto');
  var bcrypt = require('bcrypt-nodejs');
  var db = mysql.createPool({
    host : '14.63.196.48' ,
    port : '3306',
    user : 'root',
    password : 'Rkakdqpfm!00',
    database : 'oshow',
    multipleStatements : true //프로시저 사용하기 위해 필요한 옵션
  });


  router.get('/', function(req, res, next) {
  	async.waterfall([
  		function(callback){
  			db.getConnection(function(err, conn) {
  				if(err){ next(err); return; }
  				callback(null,conn);
  			});
  		},function(conn,callback){
  			var id = req.session.passport.user.id;
  			conn.query('select c.customer_name, c.customer_id, c.customer_tel, c.auth, f.fame_name,f.fame_img from customers c, fame f where c.customer_id = ? and c.fame_name=f.fame_name',id, function(err, rows) {
  				if(err){ next(err); }
  				else{
  					callback(null,conn,rows);
  				}
  			});
  		},function(conn,info,callback){
  			var id = req.session.passport.user.id;
  			conn.query('select reservation.reservation_no, restaurant.restaurant_name, reservation.reservation_date, reservation.reservation_time, reservation.table_no, reservation.deposit, reservation.reservation_runtime from reservation, restaurant where reservation.customer_id=? and reservation.reservation_date>date_add(NOW(),INTERVAL -1 day) and reservation.restaurant_no = restaurant.restaurant_no order by reservation.reservation_date desc',id, function(err, rows) {
  				if(err){ next(err); }
  				else{
  					callback(null,conn,info,rows);
  				}
  			});
  		},function(conn,info,result,callback){
  			var resultArr = [];
  			async.eachSeries(result,function(i,callb){
  				conn.query('select menu_name from reservation_menu where reservation_no = ?',i.reservation_no,function(err,menu){
  					if(err){ next(err); }
  					else{
  						var menuArr =[];
  						for(var j = 0;j<menu.length;j++){
  							menuArr.push(menu[j].menu_name);
  						}
  						var obj = {
                reservation_no : i.reservation_no,
  							restaurant_name : i.restaurant_name,
  							reservation_date : moment(i.reservation_date).format('YYYY[년 ]MM[월 ]DD[일 ]'),
  							reservation_time : parseInt(i.reservation_time),
  							table_no : i.table_no,
  							deposit : i.deposit,
  							runtime : i.reservation_runtime,
  							menu : menuArr
  						}
  						if(menuArr.length==0){
  							obj.menu = "미정";
  						}
  						resultArr.push(obj);
  						callb();
  					}
  				});
  			},function(err){
  				callback(null,conn,info,resultArr);
  			});
  		},function(conn,info,result1,callback){
  			var id = req.session.passport.user.id;
  			conn.query('select reservation.reservation_no, restaurant.restaurant_name, reservation.reservation_date, reservation.reservation_time, reservation.table_no, reservation.deposit, reservation.reservation_runtime, reservation.is_show from reservation, restaurant where reservation.customer_id=? and reservation.reservation_date<=date_add(NOW(),INTERVAL -1 day) and reservation.restaurant_no = restaurant.restaurant_no order by reservation.reservation_date desc',id, function(err, rows) {
  				if(err){ next(err); }
  				else{
  					callback(null,conn,info,result1,rows);
  				}
  			});
  		},function(conn,info,result1,result,callback){
  			var resultArr = [];
  			var showCount = 0;
  			async.eachSeries(result,function(i,callb){
  				conn.query('select menu_name from reservation_menu where reservation_no = ?',i.reservation_no,function(err,menu){
  					if(err){ next(err); }
  					else{
  						var menuArr =[];
  						for(var j = 0;j<menu.length;j++){
  							menuArr.push(menu[j].menu_name);
  						}
  						var obj = {
  							restaurant_name : i.restaurant_name,
  							reservation_date : moment(i.reservation_date).format('YYYY[년 ]MM[월 ]DD[일 ]'),
  							reservation_time :  parseInt(i.reservation_time),
  							table_no : i.table_no,
  							deposit : i.deposit,
  							runtime : i.reservation_runtime,
  							isShow : i.is_show,
  							menu : menuArr
  						}
  						if(menuArr.length==0){
  							obj.menu = "미정";
  						}
  						if(i.is_show==1){
  							showCount++;
  						}
  						resultArr.push(obj);
  						callb();
  					}
  				});
  			},function(err){
  				conn.release();
  				callback(null,info,result1,resultArr,showCount);
  			});
  		}],function(error,info,result1,result2,showCount){
  			if(info[0].customer_tel != null){
  				var decipher = crypto.createDecipher('aes128', 'Rkakdqpfm');
  				decipher.update(info[0].customer_tel,'hex','utf8');
  				var decip_tel = decipher.final('utf8');
  			}
  			if(info[0].customer_tel == null) var decip_tel = ' ';
       res.render('Cl_Mypage', {info:info, result:result1, result2:result2 ,showCount:showCount,tel : decip_tel});
     });
});

router.post('/cl_My_03', function(req, res) {
  var name = req.body.name;
  var cpw = req.body.password;
  var tel = req.body.telephone;
  var id = req.body.id;

  db.getConnection(function(err, conn) {
    if(err){
     next(err);
   }
   else{
    var cipher = crypto.createCipher('aes128', 'Rkakdqpfm');
    cipher.update(req.body.telephone,'utf8','hex');
    var cipher_tel = cipher.final('hex');

    var pw = bcrypt.hashSync(req.body.password, null, null);

    async.waterfall([function(callback){
      if(name!=""){
        conn.query("update customers set customer_name=? where customer_id=?", [req.body.name,req.body.id], function(err, rows) {
         if(err) return err;
       });
      }
      callback(null);
    },function(callback){
      if(cpw!=""){
        conn.query("update customers set customer_pw=?, where customer_id=?", [pw,req.body.id], function(err, rows) {
         if(err) return err;
       });
      }
      callback(null);
    },function(callback){
      if(tel!=""){
        conn.query("update customers set customer_tel=? where customer_id=?", [cipher_tel,req.body.id], function(err, rows) {
         if(err) return err;
       });
      }
      callback(null);
    }],function(err){
      conn.release();
      res.redirect('/');
    });
  }
});
});
router.post('/cancle',function(req,res){
  console.log("hello");
  db.getConnection(function(err,conn){
    if(err){
      next(err);
    }
    else{
      conn.query("delete from reservation where reservation_no=?",req.body.reservation_no,function(err,rows){
        if(err) return err;
        conn.release();
        res.send({result:true});
      })
    }
  });
});
return router;
}