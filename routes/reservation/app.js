module.exports = function(){
	var express = require('express');
	var async = require('async');
	var moment = require('moment');
	var router = express.Router();

	var db = require('../../models/db');

	/* GET home page. */
	router.get('/', function(req, res, next) {
		if(req.session.passport==null){
			res.render('index2', { title: 'ohshow', login: false, restaurant_no:req.param('no'), pic_url:"/html/"+req.param('no')+".jpg"});
		}
		else{
			res.render('index2', { title: 'oshow', login: true, restaurant_no:req.param('no'), pic_url:"/html/"+req.param('no')+".jpg"});
		}

	});
	router.post('/getHoliday',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		db.getConnection(function(err, conn) {
			if(err){ next(err); return; }
			conn.query('select * from holiday where restaurant_no=?',restaurant_no, function(err, rows) {
				if(err){ next(err); }
				else{
					var arr = [];
					async.eachSeries(rows,function(i,callb){
						arr.push(moment(i.holiday_date).format('l'));
						callb();
					},function(err){
						res.send({result:true, restaurant_no:restaurant_no, holidays:arr});
					});
				}
				conn.release();
			});
		});
	});
	router.post('/getMenu',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		db.getConnection(function(err, conn) {
			if(err){ next(err); return; }
			conn.query('select * from menu where restaurant_no=?',restaurant_no, function(err, rows) {
				if(err){ next(err); }
				else{
					res.send({result:true, restaurant_no:restaurant_no, rows:rows});
				}
				conn.release();
			});
		});
	});

	router.post('/getMenuDeposit',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		db.getConnection(function(err, conn) {
			if(err){ next(err); return; }
			conn.query('select restaurant_deposit_menu from restaurant where restaurant_no=?',restaurant_no, function(err, rows) {
				if(err){ next(err); }
				else{
					res.send({result:true, restaurant_no:restaurant_no, deposit:rows[0].restaurant_deposit_menu});
				}
				conn.release();
			});
		});
	});

	router.post('/getMemberDeposit',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		db.getConnection(function(err, conn) {
			if(err){ next(err); return; }
			conn.query('select restaurant_deposit_member from restaurant where restaurant_no=?',restaurant_no, function(err, rows) {
				if(err){ next(err); }
				else{
					res.send({result:true, restaurant_no:restaurant_no, deposit:rows[0].restaurant_deposit_member});
				}
				conn.release();
			});
		});
	});

	router.post('/getRunTime',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		db.getConnection(function(err, conn) {
			if(err){ next(err); return; }
			conn.query('select restaurant_opening_time, restaurant_closing_time from restaurant where restaurant_no=?',restaurant_no, function(err, rows) {
				if(err){ next(err); }
				else{
					res.send({result:true, restaurant_no:restaurant_no, opening_time:parseInt(rows[0].restaurant_opening_time), closing_time:parseInt(rows[0].restaurant_closing_time)});
				}
				conn.release();
			});
		});
	});

	router.post('/showTable',function(req,res,next){
		var restaurant_no = req.body.restaurant_no;
		var reservation_date = req.body.reservation_date;
		var reservation_time = req.body.reservation_time+":00";
		db.getConnection(function(err,conn){
			if(err){
				next(err); return;
			}
			conn.query('select table_no from reservation where restaurant_no=? and reservation_date=? and reservation_time=?',[restaurant_no,reservation_date,reservation_time],function(err,rows1){
				if(err){
					next(err);
				}
				else{
					var tables = [];
					async.eachSeries(rows1,function(i,callb){
						tables.push(i.table_no);
						callb();
					},function(err){
						var reservation_time = (req.body.reservation_time-1)+":00";
						conn.query('select table_no from reservation where restaurant_no=? and reservation_date=? and reservation_time=?',[restaurant_no,reservation_date,reservation_time],function(err,rows2){
							if(err){
								next(err);
							}
							else{
								async.eachSeries(rows2,function(i,callb){
									tables.push(i.table_no);
									callb();
								},function(err){
									res.send({result:true, tables:tables});
								});
							}
						});
					});
				}
			});
		});
	});

	router.post('/reserve',function(req,res,next){

		var restaurant_no = req.body.restaurant_no;
		var customer_id = req.session.passport.user.id;
		var table_no = req.body.table_no;
		var reservation_date = req.body.reservation_date;
		var reservation_time = req.body.reservation_time+":00";
		var reservation_number = req.body.seat;
		var reservation_request =req.body.reservation_request;
		var deposit = req.body.deposit;
		var reservation_menu_request = req.body.menu_request;
		var reservation_no =restaurant_no+'_'+reservation_date+reservation_time+'_'+table_no;

		db.getConnection(function(err,conn){
			if(err){
				next(err); return;
			}
			conn.query("INSERT INTO reservation VALUES(?,?,?,?,?,?,?,?,?,?,?,?)",[reservation_no,restaurant_no,customer_id,table_no,reservation_date,reservation_time,new Date().getTime(),reservation_number,reservation_menu_request,deposit,2,'o'],function(err,rows){
				if(err){
					console.log(err);
					next(err);
				}
				else{
					res.send({result:true});
				}
			});
		});
	});

	return router;
};
