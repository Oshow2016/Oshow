/* routes/authentication.js
 * by BO LYUN
 */
var login = require('../models/login_util');
var async = require('async');
var mysql = require('mysql');
var dbconfig = require('../models/database'); 
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database); //use oshow;

module.exports = function(app, passport) {
	var express = require('express');
	var router = express.Router();
	// =====================================
	// HOME PAGE (with login links) ========
	// =====================================

	router.get('/', function(req, res) {
		res.render('cl_main.ejs', {
			message: req.flash('authMessage'),
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGIN ==============================
	// =====================================
	// show the login form
	router.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
	});
	// process the login form
	router.post('/login', passport.authenticate('local-login', {
            successRedirect : '/authentication', 
            failureRedirect : '/login', 
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
    });
	//login by facebook account (oauth)
	router.get('/naver-login', passport.authenticate('naver',{
	}));
	router.get('/naver-login/callback',
		    passport.authenticate('naver', {
		    	successRedirect: '/authentication',
		        failureRedirect: '/login' }));
	//login by google account (oauth)
	router.get('/Google-login', passport.authenticate('google',{
		scope : [
		         'https://www.googleapis.com/auth/userinfo.profile',
				 'https://www.googleapis.com/auth/userinfo.email']
	}));
	router.get('/Google-login/callback',
		    passport.authenticate('google', {
		    	successRedirect: '/authentication',
		        failureRedirect: '/login' }
		    ));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	router.get('/signup', function(req, res) {
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});
	// process the signup form
	router.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/authentication', 
		failureRedirect : '/signup', 
		failureFlash : true 
	}));
	
	// process the local-signup by email
	router.get('/auth/:member_type/:id/:code', function(req, res, done){
		var sel_query = dbconfig.query.sel_id_cl;
		var upd_query = dbconfig.query.upd_auth_cl;
		if(req.params.member_type=='owner'){
			sel_query = dbconfig.query.sel_id_ow;
			upd_query = dbconfig.query.upd_auth_ow;
		}
		connection.query(sel_query, [req.params.id], function(err, rows) {
			if (err)	return done(err);
			if(!rows.length) return done(null, false);
    		if (rows.length) {
    			if(rows[0].auth == req.params.code){
    				async.series([function(callback){
    				            	  connection.query(upd_query,[req.params.id],
    				    						function(err, rows){
    				            		  		callback(null);
    				            	  });
    				              },function(callback){
    				            	  connection.query(sel_query, [req.params.id], function(err, rows){
    				            	  var Usr = new login.UsrObjt();
		   	       	            	   Usr.setUsr2(req.params.member_type,rows);
		   	       	            	   callback(null, Usr.getUsr());
    				            	  });
    				              }],function(err, result){
    									res.redirect('/authentication');
    				});
    			}
    			if(rows[0].auth == 'success'){
    				res.render('cl_main.ejs', {
 						message: '잘못된 접근입니다!',
 						user:req.user});
    			}
    		}
		})

	});


	// =====================================
	// PROFILE SECTION =====================
	// =====================================

	router.get('/authentication', isLoggedIn, function(req, res) {
		if(req.user.type=='customer'){
			res.redirect('/');
		}
		if(req.user.type=='owner'){
			res.redirect('/ownerMain');
		}
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	router.get('/logout', function(req, res) {
		req.user='undefined';
		req.logout();
		res.redirect('/');
	});
	return router;
};

// route middleware to make sure
function isLoggedIn(req, res, next) {
	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();
	// if they aren't redirect them to the home page
	res.redirect('/');
}
