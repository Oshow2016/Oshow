module.exports = function(app){
  var express = require('express');
  var router = express.Router();
  var mysql = require('mysql');
  var multer = require('multer');
  var connection = mysql.createConnection({
    host : '14.63.196.48' ,
    port : '3306',
    user : 'root',
    password : 'Rkakdqpfm!00',
    database : 'oshow',
    multipleStatements : true //프로시저 사용하기 위해 필요한 옵션
  });
//======================================================================

  var menu_storage   =   multer.diskStorage({
       destination: function (req, file, callback) {
         callback(null, './public/images/menu');
       },
       filename: function (req, file, callback) {
         callback(null, Date.now() + '_' +  file.originalname);
       }
     });
  var restaurant_storage   =   multer.diskStorage({
       destination: function (req, file, callback) {
         callback(null, './public/images/restaurant');
       },
       filename: function (req, file, callback) {
         callback(null, Date.now() + '_' + file.originalname );
       }
     });
  var restaurant_upload = multer({ storage : restaurant_storage }).array('restaurant_picture',10);
  var menu_upload = multer({ storage : menu_storage }).array('menu_picture',10);
  //======================================================================
  /* 테이블등록*/
  var tmp_upload = multer({
     dest: './public/images/menus/'});
  var table_type = tmp_upload.single('table_image');

  var fs = require('fs');

  router.get('/',function(req,res,next)
      {
     var id = req.session.passport.user.id;
       // 앞으로 datas에는  owner가 레스토랑 등록했을 때 부여 된 restaurant_no값 들어가야 함
        // owner_id에 restaurant_no 컬럼이 null 이면 아무것도 안보여짐
        // null 아닌 경우 해당 restaurant_no에 대한 정보 보여지도록
         var owner_query = connection.query('select restaurant_no,auth from owners where owner_id=?', id, function(err_owner,row_owner){
        var datas = row_owner[0].restaurant_no;
        var owner_auth = row_owner[0].auth;
        console.log("datas : " + datas)
         /* 레스토랑 정보 입력한 적이 없는 owner인 경우
          row가 null이면 메뉴,휴무일도 등록이 될 수 없으므로 null */
        if (datas == null){
           res.render('Ow_Rg_01', {title:"OSHOW 레스토랑 정보등록", owner_auth:"", row:"", row_menu:"", row_holiday:""});
        }
        else
           {
           var query = connection.query('select restaurant_name,restaurant_opening_time,restaurant_closing_time,restaurant_type,restaurant_address,restaurant_tel,restaurant_deposit_member,restaurant_deposit_menu,restaurant_introduce from restaurant where restaurant_no=?' , datas, function(err,row){
                 var menu_query = connection.query('select menu_name from menu where restaurant_no=?' , datas, function(err_menu,row_menu){
                   var holiday_query = connection.query('select holiday_date from holiday where restaurant_no=?' , datas, function(err_holiday,row_holiday){
                        console.log("레스토랑 정보 조회 결과 확인 : ", row_owner);
                         res.render('Ow_Rg_01', {title:"OSHOW 레스토랑 정보등록", owner_auth:owner_auth, row:row[0], row_menu:row_menu[0], row_holiday:row_holiday[0]});
                         console.log("휴가 format결과 : ", row_holiday.holiday_date);

        }); //holiday
      }); //menu
    });   //restaurant
           }
  }); //owner
 }); //router.get

  router.post('/', function(req,res){
     /*입력 값 DB저장 */
   restaurant_upload(req,res,function(err) {
      console.log("!!!!!!" );
      console.log(req.body.restaurant_name);
      var r = {
              'restaurant_name':req.body.restaurant_name,
                  'restaurant_opening_time':req.body.restaurant_opening_time,
                  'restaurant_closing_time':req.body.restaurant_closing_time,
                  'restaurant_type':req.body.restaurant_type,
                  'restaurant_address':req.body.restaurant_address,
                  'restaurant_tel':req.body.restaurant_tel,
                  'restaurant_deposit_member' : req.body.restaurant_deposit_member,
                  'restaurant_deposit_menu' :req.body.restaurant_deposit_menu,
                 'restaurant_introduce' : req.body.restaurant_introduce,
                  'holiday_date' : req.body.holiday_date,
                  'id' : req.session.passport.user.id
                  };
      console.log(req.files);
        var query = connection.query('CALL ps_SetRestaurantInfo (?, ?, ?, ?, ? ,?, ?, ?, ?, ?, ?)', [r.id, r.restaurant_name, r.restaurant_opening_time,r.restaurant_closing_time,
                                                                                                     r.restaurant_type, r.restaurant_address, r.restaurant_tel,
                                                                                                     r.restaurant_deposit_member,r.restaurant_deposit_menu,
                                                                                                     r.restaurant_introduce, r.holiday_date ], function(err,result){
                                  if (err) {
                                      console.error(err);
                                      throw err;
                                  }

                                  else{
      for(var x = 0; x < req.files.length; x++){
                var r = {
                  //!!!restaurant_no에 현재 owner가 등록한 레스토랑 넘버 가져와야 함
                  'owner_id' : req.session.passport.user.id, //!!! owner_id 들어갈 곳
                  'r_pic' : req.files[x].path
                    }; //r

         var query_pic = connection.query('CALL ps_SetRestaurantPicture (?,?)',[r.owner_id, r.r_pic],function(err,result){
                if (err) {
                    console.error(err);
                    throw err;
                } //if

         }); //query_pic
      } //for
                                  }
         });
   }); //r_upload;
    //console.log(query)
    res.redirect('/ownerPage');
  });



  router.post('/menu',  function(req,res){
     menu_upload(req,res,function(err) {
         console.log("!!!!!!" );
         console.log(req.files);
         for(var x = 0; x < req.files.length; x++){
                   var menu = {
                     //!!!restaurant_no에 현재 owner가 등록한 레스토랑 넘버 가져와야 함
                     'owner_id' : req.session.passport.user.id, //!!! owner_id 들어갈 곳
                     'menu_pic' : req.files[x].path
                       }; //menu

            var query = connection.query('CALL ps_SetMenu (?,?)',[menu.owner_id, menu.menu_pic],function(err,result){
                   if (err) {
                       console.error(err);
                       throw err;
                   } //if

            });
         }
         if(err) {
               console.log('에러');
               }
         else
            {
            res.redirect('/ownerPage');
            }
    });
  });



  /** Permissible loading a single file,
      the value of the attribute "name" in the form of "recfile". **/

  router.post('/file', table_type, function (req,res) {
     var id = req.session.passport.user.id;
    /** When using the "single"
        data come in "req.file" regardless of the attribute "name". **/
    var tmp_path = req.file.path;

    /** The original name of the uploaded file
        stored in the variable "originalname". **/
    var target_path = './public/images/table/' + id + "_" + req.file.originalname;

    /** A better way to copy the uploaded file. **/
    var src = fs.createReadStream(tmp_path);

    var dest = fs.createWriteStream(target_path);
    console.log('테이블 이미지 저장 경로 : ' + target_path);
    src.pipe(dest);
    //src.on('end', function() { res.render('complete'); });
    //src.on('error', function(err) { res.render('error'); });

    res.redirect('/OwnerPage');

  });
  return router;
};
