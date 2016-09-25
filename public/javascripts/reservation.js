angular.module('reservation', [])
.controller('reservationController',['$scope', function($scope) {
	this.restaurant_no = 0;
	this.reservation_date = null;
	this.seat = null;
	this.seats = null;
	this.menu_request = null;
	this.reservation_time = null;
	this.payment = null;
	this.show = null;
	this.telephone = null;
	this.table = null;
	var IMP = window.IMP;

	this.init = function init(res_no){
		this.restaurant_no = res_no;
		this.reservation_date = null;
		this.seat = null;
		this.seats = null;
		$("#setSeats").html("");
		this.menu_request = "";
		$("#deposit").html("");
		this.reservation_time = null;
		this.payment = null;
		this.setMenuList();
		this.setTimes();
		this.telephone = null;
		this.table = null;
		IMP.init('imp48792908');

		$('.table').css("background","none");
		$('.table').css("pointer-events","none");

		$( ".calendar" ).datepicker("destroy");
		$.ajax({
			url: 'http://127.0.0.1:3000/reservation/getHoliday',
			dataType: 'json',
			type: 'POST',
			data: {'restaurant_no':res_no},
			success: function(result) {
				var htmlString = "";
				if ( result.result == true ) {
					$( ".calendar" ).datepicker({
						rigional : "ko",
						showMonthAfterYear: true,
						monthNames: ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"],
						altField:"#selectedDate",
						dateFormat: "yy-mm-dd",
						minDate : "0",
						maxDate : "+2m",
						dayNames: [  "일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일" ],
						dayNamesMin: [ "일", "월", "화", "수", "목", "금", "토" ],
						beforeShowDay: function(date){
							for(var i = 0;i<result.holidays.length;i++){
								if((date.getMonth()+1)+'/'+date.getDate()+'/'+date.getFullYear() == result.holidays[i] ) {
									return [false];
								}
							}
							return [true];
						}
					});
				}
			},
			error:function(request,status,error) {
				window.alert(request.status);
			}
		});
	};

	this.setDate = function setDate(){
		if(this.reservation_date != $("#selectedDate").val()){
			this.seat = null;
			this.seats = null;
			$("#setSeats").html("");
			this.reservation_time = null;
			this.setTimes();
			this.reservation_date = $("#selectedDate").val();
			this.telephone=null;
			this.table=null;
			this.payment = null;
			$('.table').css("background","none");
			$('.table').css("pointer-events","none");
			$("#deposit").html(deposit_price);
			$("#deposit").val(deposit_price);
		}
	};

	this.setTimes= function setTimes(){
		$.ajax({
			url: 'http://127.0.0.1:3000/reservation/getRunTime',
			dataType: 'json',
			type: 'POST',
			data: {'restaurant_no':this.restaurant_no},
			success: function(result) {
				var htmlString = "";
				if ( result.result == true ) {
					htmlString +="<option value=''>---예약 시간---</option>";
					for(var i = result.opening_time;i<result.closing_time;i++){
						htmlString +="<option value="+i+">"+i+":00 </option><p />";
					}
					$('#reservation_time').html(htmlString);
				}
			},
			error:function(request,status,error) {
				window.alert(request.status);
			}
		});
	};

	this.showTable = function showTable(){
		$.ajax({
			url: 'http://127.0.0.1:3000/reservation/showTable',
			dataType: 'json',
			type: 'POST',
			data: {'restaurant_no':this.restaurant_no,'reservation_date':this.reservation_date,'reservation_time':this.reservation_time},
			success: function(result) {
				var htmlString = "";
				if ( result.result == true ) {
					$('.table').css("pointer-events","auto");
					for(var i =0;i<result.tables.length;i++){
						$('#table'+result.tables[i]).css("pointer-events","none");
					}
				}
			},
			error:function(request,status,error) {
				window.alert(request.status);
			}
		});
	};

	this.setMenuList = function setMenuList(){
		$.ajax({
			url: 'http://127.0.0.1:3000/reservation/getMenu',
			dataType: 'json',
			type: 'POST',
			data: {'restaurant_no':this.restaurant_no},
			success: function(result) {
				var htmlString = "";
				if ( result.result == true ) {
					for(var i = 0;i<result.rows.length;i++){
						htmlString +="<input type='checkbox' class='menu' name="+result.rows[i].menu_name+" value="+result.rows[i].price+">"+result.rows[i].menu_name+" price : "+result.rows[i].price+"</input><p />";
					}
					htmlString +="<script src='javascripts/menu.js'></script>";
					$('#menuList').html(htmlString);
				}
			},
			error:function(request,status,error) {
				window.alert(request.status);
			}
		});
	};

	this.reservedMenu = function reservedMenu(){
		var arr = [];
		$("input[class='menu']:checked").each(function(){
			arr.push($(this).attr('name'));
		});
		return arr;
	};

	this.totalPrice = function totalPrice(){
		var sum = 0;
		$("input[class='menu']:checked").each(function(){
			sum+=parseInt($(this).val());
		});
		return sum;
	};

	this.showReservation = function showReservation(){
		var str = "restaurant_no : "+this.restaurant_no;
		str += "<br> reservation_date : "+this.reservation_date;
		if(this.seat!="show"){
			str += "<br> seat : "+this.seat;
		}
		else{
			str += "<br> seat : "+this.seats;
		}

		str += "<br> totalPrice : "+this.totalPrice();
		if(this.reservedMenu().length!=0){
			str += "<br> reservedMenu : "+this.reservedMenu();
		}
		else{
			str += "<br> reservedMenu : 미 정";
		}
		str += "<br> reservation_time : "+this.reservation_time;
		if(this.menu_request!=""){
			str += "<br> menu_request : "+this.menu_request;
		}
		else{
			str += "<br> menu_request : 없음";
		}
		str +="<br> table :"+this.table;

		$('#reservation_info').html(str);
	};

	this.getDepositPrice = function getDepositPrice(){
		var price = this.totalPrice();
		this.showReservation();
		if(this.seat =="show"){
			var theNumber = this.seats;
		}
		else{
			var theNumber = this.seat;
		}
		if(price!=0)
		{
			$.ajax({
				url: 'http://127.0.0.1:3000/reservation/getMenuDeposit',
				dataType: 'json',
				type: 'POST',
				data: {'restaurant_no':this.restaurant_no},
				success: function(result) {
					var deposit_price = parseInt(price) * parseInt(result.deposit) /100;
					$("#deposit").html(deposit_price);
					$("#deposit").val(deposit_price);
				},
				error:function(request,status,error) {
					window.alert("getDepositPrice1 error : ",request.status);
				}
			});
		}
		else{
			if(theNumber==null){
				window.alert('몇명 예약하는지 작성하시오');
			}
			else{
				$.ajax({
					url: 'http://127.0.0.1:3000/reservation/getMemberDeposit',
					dataType: 'json',
					type: 'POST',
					data: {'restaurant_no':this.restaurant_no},
					success: function(result) {
						var deposit_price = parseInt(theNumber) * parseInt(result.deposit);
						$("#deposit").html(deposit_price);
						$("#deposit").val(deposit_price);
					},
					error:function(request,status,error) {
						window.alert("getDepositPrice2 error : ",request.status);
					}
				});
			}
		}
	};

	this.pay = function pay() {
		var res_no = this.restaurant_no;
		var res_date = this.reservation_date;
		var res_time = this.reservation_time+":00";
		var menu_req = this.menu_request;
		var res_table = this.table;
		var seatNum = 0;

		if(this.seat!="show"){
			seatNum = this.seat;
		}
		else{
			seatNum = this.seats;
		}

		IMP.request_pay({
		    pg : 'inicis', // version 1.1.0부터 지원.
		        /*
		            'kakao':카카오페이,
		            'inicis':이니시스, 'html5_inicis':이니시스(웹표준결제),
		            'nice':나이스,
		            'jtnet':jtnet,
		            'uplus':LG유플러스,
		            'danal':다날
		            */
		    pay_method : 'card', // 'card':신용카드, 'trans':실시간계좌이체, 'vbank':가상계좌, 'phone':휴대폰소액결제
		    merchant_uid : 'merchant_' + new Date().getTime(),
		    name : '주문명:결제테스트',
		    amount : $("#deposit").val(), //디비뭐니
		    buyer_email : 'iamport@siot.do', //customer_id
		    buyer_name : '구매자이름', //customer_name
		    buyer_tel : this.telephone, //customer_tel
		  }, function(rsp) {
		  	if ( rsp.success ) {
		  		var msg = '결제가 완료되었습니다.';
		  		msg += '고유ID : ' + rsp.imp_uid;
		  		msg += '상점 거래ID : ' + rsp.merchant_uid;
		  		msg += '결제 금액 : ' + rsp.paid_amount;
		  		msg += '카드 승인번호 : ' + rsp.apply_num;
		  	} else {
		  		var msg = '결제에 실패하였습니다.';
		  		msg += '에러내용 : ' + rsp.error_msg;
		  	}

		  	$.ajax({
		  		url: 'http://127.0.0.1:3000/reservation/reserve',
		  		dataType: 'json',
		  		type: 'POST',
		  		data: {'restaurant_no':res_no,
		  		"reservation_date" : res_date,
		  		'seat' : seatNum,
		  		"deposit" : $("#deposit").val(),
		  		"reservation_time":res_time,
		  		"menu_request":menu_req,
		  		"table_no":res_table
		  	},
		  		success: function(result) {
		  			location.href="http://127.0.0.1:3000/myPage";
		  		},
		  		error:function(request,status,error) {
		  			window.alert("pay: ",request.status);
		  		}
		  	});

		  	window.alert(msg);

		  });
	};
}]);

