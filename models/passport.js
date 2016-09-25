/* models/passport.js
 * by BO LYUN
 */
// load all the modules we need
var async = require('async');
var LocalStrategy   = require('passport-local').Strategy;
var NaverStrategy = require('passport-naver').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var login = require('./login_util');
var mail = require('./mail');
var url = require('url');
// load up the user model
var mysql = require('mysql');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database'); //config > database.js
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database); //use oshow;

module.exports = function(passport) {
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
	passport.serializeUser(function(user, done) {
	    done(null, user);
	});
	passport.deserializeUser(function(user, done) {
		console.log(user);
		done(null, user);
	});
	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use(
        'local-signup',
        new LocalStrategy({
            // by default, local strategy uses username and password, we will override with email
            usernameField : 'id',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, id, password, done) {
                  	 	//입력값들의 유효성 검사 , DB조회가 필요 없음!
		   	if(login.CheckValidity(password) == false )
		   		return done(null, false, req.flash('signupMessage', 'PASSWORD는 영문,숫자를 혼합한 6자 이상으로 해주세요!'));
		   	if(login.CheckPhoneNumber(req.body.tel)== false )
		   		return done(null, false, req.flash('signupMessage', '번호를 정확히 입력해주세요!'));

		   	var query = dbconfig.query.sel_id_cl;
		   	if(req.body.member_type=='owner')	query = dbconfig.query.sel_id_ow;

			var cipher = crypto.createCipher('aes128', 'Rkakdqpfm');
            cipher.update(req.body.tel,'utf8','hex');
       	 	var cipher_tel = cipher.final('hex');

		   	connection.query(query,[id], function(err, rows) {
		   		if (err)	return done(err);
		   		if (rows.length) {
		   		  	return done(null, false, req.flash('signupMessage', '이미 가입한 회원이시네요!'));
		   		}else {
		   		  	var rndcode = new login.RndStr();
		   		   	rndcode.setStr();
		   		   	var newUser = {
		   		   			id: id,
				        	name: req.body.name,
				        	tel: cipher_tel,
				        	fame: 'unranked',
				        	resta_no : null,
				        	rndcode : rndcode.getStr(),
				        	auth: 'none',
				        	pw: bcrypt.hashSync(password, null, null)
		   		  	};

		   	    	async.series([function(callback){
		   	    	            	  if(req.body.member_type == 'customer'){
			        	            	   connection.query(dbconfig.query.ins_cl,[newUser.id, newUser.pw, newUser.name, newUser.tel, newUser.fame, newUser.rndcode],
			   	            			   function(err, rows) {
			     	            		   			if(err) return done(err);
			       	            		   			return callback(null);
			        	            	   });
		   	       	            	   }
		   	      	            	   if(req.body.member_type == 'owner'){
		   	       	            		   connection.query(dbconfig.query.ins_ow,[newUser.id, newUser.pw, newUser.name, newUser.tel, newUser.resta_no, newUser.rndcode],
		   	            				   function(err, rows) {
			   	        	            		   if(err) return done(err);
			  	        	            		   return callback(null);
		   	       	            		   });
		   	       	            	   }
		   	       	               },function(callback){
		   	       	            	   var authurl = url.resolve("http://127.0.0.1:3000/", "/auth");
		   	       	            	   mail.send({
			       							subject: "OSHOW 회원가입을 위한 인증 메일",
			       							text: "링크를 클릭하여 인증해주세요.\n"+authurl+"/"+req.body.member_type+"/"+newUser.id+"/"+newUser.rndcode,
			       							to: id
		   	       	            	   });
		   	       	            	   callback(null);
		   	       	               },function(callback){
		   	       	            	   var Usr = new login.UsrObjt();
		   	       	            	   Usr.setUsr1(req.body.member_type,newUser);
		   	       	            	   callback(null, Usr.getUsr());
		   	       	               }],function(err,result){
		   	       		 				return done(null, result[2], req.flash('authMessage','이메일로 인증코드를 전송했습니다. 인증하지 않으면 서비스 이용이 제한됩니다.'));
		   	       	 });
			      }
		   	   });
        }));
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'id',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, id, password, done) { // callback with email and password from our form
        	//customer로그인
        	if(req.body.member_type=='customer') var query = dbconfig.query.sel_id_cl;
        	if (req.body.member_type=='owner') var query = dbconfig.query.sel_id_ow;

        	connection.query(query,[id], function(err, rows){
            		if (err)
                        return done(err);
                    if (!rows.length)
                        return done(null, false, req.flash('loginMessage', '존재하지 않는 메일입니다.'));
                    if(req.body.member_type=='customer'){
	                   	if (!bcrypt.compareSync(password, rows[0].customer_pw))
	                    		return done(null, false, req.flash('loginMessage', '비밀번호가 틀렸습니다.'));
                    }
                    if(req.body.member_type=='owner'){
                    	if (!bcrypt.compareSync(password, rows[0].owner_pw))
                    		return done(null, false, req.flash('loginMessage', '비밀번호가 틀렸습니다.'));
                    }
                   	var Usr = new login.UsrObjt();
            		Usr.setUsr2(req.body.member_type, rows);
	     			return done(null, Usr.getUsr());
            	})
        })
    );

    // =========================================================================
    // NAVER LOGIN & SIGNUP ====================================================
    // =========================================================================
    passport.use(
        new NaverStrategy({
            clientID: 'imDALGqzpc0V_gWB2P_K',
            clientSecret:  'RW3VZkC62m',
            callbackURL : 'http://127.0.0.1:3000/naver-login/callback'
        },
        function(accessToken, refreshToken, profile, done) {
        	//해당 email로 등록된 계정이 있는지 확인
        	connection.query(dbconfig.query.sel_id_cl,[profile._json.email], function(err, rows) {
        		var Usr = new login.UsrObjt();
        		if (err)	return done(err);
     			if(!rows.length) {
     				 //계정 없는 경우 DB등록
     		      		var newUser = {
     		      				id: profile._json.email,
     		      				name: profile._json.nickname,
     		      				tel: null,
     		      				fame: 'unranked',
     		      				auth: 'success',
     		      				pw: bcrypt.hashSync(profile.id, null, null)
     		      		};
     		     		async.series([
     		      		              function(callback){
     		      		            	  connection.query(dbconfig.query.ins_cl,[newUser.id, newUser.pw, newUser.name, newUser.tel, newUser.fame, newUser.auth],
     		      		            	  function(err, rows) {
     		      		            		  if(err) return done(err);
     		      		            		  callback(null);
     		      		            	  });
     		      		              },function(callback){
     		      		            	Usr.setUsr1('customer', newUser);
     		      		            	callback(null, Usr.getUsr());
     		      		              }],function(err, result){
     		      							return done(null, result[1]);
     		      		});
	              }
	            if(rows.length){
	            	Usr.setUsr2('customer', rows);
	            return done(null, Usr.getUsr());
	            }
     		});

        })
    );

    // =========================================================================
    // GOOGLE LOGIN&SIGNUP =====================================================
    // =========================================================================
    passport.use(
            new GoogleStrategy({
                clientID: '112125140526-fl89gg55jbfs9uc13igo8799o338ru6f.apps.googleusercontent.com',
                clientSecret:  'es8SS5FVGYRGq9v-g37X6ziL',
                callbackURL : 'http://127.0.0.1:3000/google-login/callback'
            },
            function(accessToken, refreshToken, profile, done) {
            	connection.query(dbconfig.query.sel_id_cl,[profile.emails[0].value], function(err, rows) {
            		var Usr = new login.UsrObjt();
            		if (err)	return done(err);
         			if(!rows.length) {
         				 //계정 없는 경우 DB등록
         		      		var newUser = {
         		      				id: profile.emails[0].value,
         		      				name: profile.displayName,
         		      				tel: null,
         		      				fame: 'unranked',
         		      				auth: 'success',
         		      				pw: bcrypt.hashSync(profile.id, null, null)
         		      		};
         		      		async.series([
         		      		              function(callback){
         		      		            	  connection.query(dbconfig.query.ins_cl,[newUser.id, newUser.pw, newUser.name, newUser.tel, newUser.fame, newUser.auth],
         		      		            	  function(err, rows) {
         		      		            		  if(err) return done(err);
         		      		            		  callback(null);
         		      		            	  });
         		      		              },function(callback){
         		      		            	Usr.setUsr1('customer', newUser);
         		      		            	callback(null, Usr.getUsr());
         		      		              }],function(err, result){
         		      							return done(null, result[1]);
         		      		});
    	              }
    	            if(rows.length){
    	            	Usr.setUsr2('customer', rows);
    	            return done(null, Usr.getUsr());
    	            }
         		});
            })
        );
};

