var keyword1;
var keyword2;
var current_latitude;
var current_longitude;
var submit = $('input:image');
var search = $('#search');
var bottom = $('#bottom');
var global_name_addr = [];
var global_count=0;

if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
				current_latitude = position.coords.latitude;
				current_longitude =  position.coords.longitude;
	}, function(error) {
					alert('Error occurred. Error code: ' + error.code);
	}); }else{
					alert('no geolocation support');
			}

$('h1').on('click',function(){
	window.location.reload(true);
});

$('input[name="cc"]').change(function(){
		if($(':text[name="search_block_form"]').val().length!=0){
			send();
		} else if(search.attr('class')!='translate' && $(':radio[name="cc"]:checked').val()=='location'){
			search.addClass('translate');
			setTimeout(function result(){
				$('#result').addClass('result');
				$('#result').css('visibility', 'visible');
				map();
			},1000);
		} else if(search.attr('class')=='translate' && $(':radio[name="cc"]:checked').val()=='location'){
			$('#result').children().children().detach();
			bottom.children().detach();
			bottom.html("");
			map();
		}
});

submit.on('click',send);
$('input:text').focus();
$('input:text').bind("keydown", function(e) {
			if (e.keyCode == 13) { // enter key
					send();
					return false;
			}
});


function send() {
	keyword1 = $(':radio[name="cc"]:checked').val();
	keyword2 = $(':text[name="search_block_form"]').val();

	if($('input:text').val().length!=0){
		$.get(
            "http://127.0.0.1:3000/clientMain/search",
						{radio:keyword1 ,
						 search:keyword2},
            function(data){
							if(keyword1=='location'){
								if(search.attr('class')!='translate'){
									search.addClass('translate');
									setTimeout(function result(){
										$('#result').addClass('result');
										$('#result').css('visibility', 'visible');
									},1000);
								} else{
									$('#result').children().children().detach();
									bottom.children().detach();
									bottom.html("");
								}
								map(data);
							} else if(search.attr('class')!='translate'){
								search.addClass('translate');
								setTimeout(function result(){
									$('#result').addClass('result');
									$('#result').css('visibility', 'visible');
									list(data);
								},1000);
							} else{
								$('#result').children().children().detach();
								bottom.children().detach();
								bottom.html("");
								list(data);
							}
					});
				}
}

function list(data){
	if(data.length!=1){
		for(var i=0;i<data.length-1;i++){
				$('#result').children().append("<a href='#' class='list'><li class='info'>"+data[i].restaurant_name+"<br>"+
						data[i].restaurant_address+"</li></a>");
		}

		bottom.append('| ');
		for(var i=0;i<data[data.length-1]/4;i++){
			if(i==0) {
					bottom.append("<a href='#' class='no' style='color:red'> "+(i+1)+"</a> |");
			}
			else {
					bottom.append("<a href='#' class='no'> "+(i+1)+"</a> |");
			}
		}

		$('.no').on('click',function (event) {
				event.preventDefault();
				var no = $(this).text();
				var bono = bottom.children().length;

				$.ajax({
            url:"http://127.0.0.1:3000/clientMain/search/"+keyword1+"/"+keyword2+"/"+no,
            success:function(data){
							$('#result').children().children().detach();
                for(var i=0;i<data.length;i++){
									$('#result').children().append("<a href='#' class='list'><li class='info'>"+data[i].restaurant_name+"<br>"+
											data[i].restaurant_address+"</li></a>");
								}

								var bo = bottom.children();
								for(var i=0;i<bono;i++){
										bo[i].style.color='black'
								}
								bo[no-1].style.color='red'
								list_click();
            }
        })
		});
		list_click();
	} else{
		$('#result').children().append("<li class='info'>검색결과:0</li>");
	}
}

function list_click(){
	$('.list').on('click',function (event) {
			var res_name = this.innerHTML.substring(17,this.innerHTML.indexOf("<br>"));
			var res_addr = this.innerHTML.substring(this.innerHTML.indexOf("<br>")+4,this.innerHTML.indexOf("</li>"));
			res_name = res_name.replace("&amp;","&");
			res_name = res_name.replace("&quot;",'"');
			res_name = res_name.replace("&lt;","<");
			res_name = res_name.replace("&gt;",">");

			small_window(res_name,res_addr);
	});
}

function map(data){

	$('#result').children().append('<div id="map" style="width:490px;height:320px;left:-0.1px;top:0.1px;position:absolute;"></div>');

	var container = document.getElementById('map'); //지도를 담을 영역의 DOM 레퍼런스
	var options = { //지도를 생성할 때 필요한 기본 옵션
			center: new daum.maps.LatLng(current_latitude,current_longitude), //지도의 중심좌표.
			level: 4 //지도의 레벨(확대, 축소 정도)
	};

	var map = new daum.maps.Map(container, options); //지도 생성 및 객체 리턴
	// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
	var mapTypeControl = new daum.maps.MapTypeControl();

		// 주소-좌표 변환 객체를 생성합니다
	var geocoder = new daum.maps.services.Geocoder();

	var marker = new daum.maps.Marker(), // 클릭한 위치를 표시할 마커입니다
	    infowindow = new daum.maps.InfoWindow({zindex:1}); // 클릭한 위치에 대한 주소를 표시할 인포윈도우입니다

	// 현재 지도 중심좌표로 주소를 검색해서 주변 레스토랑을 표시합니다
	searchAddrFromCoords(map.getCenter(), displayCenterInfo);

	function searchAddrFromCoords(coords, callback) {
	    // 좌표로 행정동 주소 정보를 요청합니다
	    geocoder.coord2addr(coords, callback);
	}

	// 지도 좌측상단에 지도 중심좌표에 대한 주소정보를 표출하는 함수입니다
	function displayCenterInfo(status, result) {
	    if (data == null) {
					$.ajax({
	            url:"http://127.0.0.1:3000/clientMain/search/all/"+result[0].fullName,
	            success:function(data){

								// 주소-좌표 변환 객체를 생성합니다
								var geocoder = new daum.maps.services.Geocoder();

								for (var i = 0; i < data.length; i++) {
									global_name_addr.push({'name':data[i].restaurant_name,'addr':data[i].restaurant_address});
									console.log(data[i].restaurant_name);
								}

								for (var i = 0; i < data.length; i++) {
									// 주소로 좌표를 검색합니다
									geocoder.addr2coord(global_name_addr[i].addr, function(status, result) {

									    // 정상적으로 검색이 완료됐으면
									     if (status === daum.maps.services.Status.OK) {
									        var coords = new daum.maps.LatLng(result.addr[0].lat, result.addr[0].lng);

									        // 결과값으로 받은 위치를 마커로 표시합니다
									        var marker = new daum.maps.Marker({
									            map: map,
									            position: coords
									        });

													for (var j = 0; j < global_name_addr.length; j++) {
														var sp = global_name_addr[j].addr.split(' ');

															if(result.addr[0].subAddress!='0'){
																if(sp[3]==result.addr[0].mainAddress+'-'+result.addr[0].subAddress){
																		var name = global_name_addr[j].name;
																		var addr = global_name_addr[j].addr;
																		break;
																}
															}else{
																if(sp[3]==result.addr[0].mainAddress){
																		var name = global_name_addr[j].name;
																		var addr = global_name_addr[j].addr;
																		break;
																}
															}

													}

									        // 인포윈도우로 장소에 대한 설명을 표시합니다
									        var infowindow = new daum.maps.InfoWindow({
									            content: '<div class="res_info" style="cursor:pointer; width:150px;text-align:center;padding:6px 0;" name="'+name+'" addr="'+addr+'">'+name+'</div>'
									        });
									        infowindow.open(map, marker);

													// 마커에 마우스아웃 이벤트를 등록합니다
													if (global_count+1==global_name_addr.length) {
														$('.res_info').on('click',function(){
															small_window($(this).attr('name'),$(this).attr('addr'));
														});
														for (var j = 0; j < global_name_addr.length; j++) {
															global_name_addr.pop();
														}
														global_count=0;
													} else{
															global_count++;
													}

												}
									});
								}
	          }
	        })
	    }
	}

	// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
	// daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
	map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

	// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
	var zoomControl = new daum.maps.ZoomControl();
	map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);

	if(data[data.length-1]!=0){
		// 주소-좌표 변환 객체를 생성합니다
		var geocoder = new daum.maps.services.Geocoder();

		// 주소로 좌표를 검색합니다
		geocoder.addr2coord(data[0].restaurant_address, function(status, result) {

		    // 정상적으로 검색이 완료됐으면
		     if (status === daum.maps.services.Status.OK) {
		        var coords = new daum.maps.LatLng(result.addr[0].lat, result.addr[0].lng);

		        // 결과값으로 받은 위치를 마커로 표시합니다
		        var marker = new daum.maps.Marker({
		            map: map,
		            position: coords
		        });

		        // 인포윈도우로 장소에 대한 설명을 표시합니다
		        var infowindow = new daum.maps.InfoWindow({
		            content: '<div class="res_info"  style="width:150px;text-align:center;padding:6px 0;">'+data[0].restaurant_name+'</div>'
		        });
		        infowindow.open(map, marker);

		        // 지도의 중심을 결과값으로 받은 위치로 이동시킵니다
		        map.setCenter(coords);

						for (var i = 0; i < global_count+1; i++) {
							global_name_addr.pop();
						}

						// 마커에 마우스아웃 이벤트를 등록합니다
						$('.res_info').on('click',function(){
							small_window(data[0].restaurant_name,data[0].restaurant_address)
						});
		    }
			});
		} else{
				// 마커를 표시할 위치와 title 객체 배열입니다
				var mPositions = [];

				var wPositions = [];

				// 마커 이미지의 이미지 주소입니다
				var imageSrc = "http://i1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png";

				for (var i = 0; i < mPositions.length; i ++) {
						// 마커 이미지의 이미지 크기 입니다
						var imageSize = new daum.maps.Size(24, 35);

						// 마커 이미지를 생성합니다
						var markerImage = new daum.maps.MarkerImage(imageSrc, imageSize);

						// 마커를 생성합니다
						var marker = new daum.maps.Marker({
								map: map, // 마커를 표시할 지도
								position: mPositions[i].latlng, // 마커를 표시할 위치
								title : mPositions[i].title, // 마커의 타이틀, 마커에 마우스를 올리면 타이틀이 표시됩니다
								image : markerImage // 마커 이미지
						});

						var infowindow = new daum.maps.InfoWindow({
								map: map,
								position : wPositions[i].iwPosition,
								content : wPositions[i].iwContent
						});

						// 마커 위에 인포윈도우를 표시합니다. 두번째 파라미터인 marker를 넣어주지 않으면 지도 위에 표시됩니다
						infowindow.open(map, marker);
				}
			}
}

function small_window(name,addr){
	$.ajax({
			url:"http://127.0.0.1:3000/clientMain/"+name+"/"+addr,
			success:function(data){
							// $('.b-close').append().detach();
							$('#window').children().detach();
							$('#window').append("<a class='b-close'>x</a>");
							$('#window').append(data);

							var currentImage;
							var currentIndex = -1;
							var interval;
							function showImage(index){
									if(index < $('#bigPic img').length){
										var indexImage = $('#bigPic img')[index]
										if(currentImage){

											if(currentImage != indexImage ){
												$(currentImage).css('z-index',2);
												clearTimeout(myTimer);
												$(currentImage).fadeOut(250, function() {
															myTimer = setTimeout("showNext()", 3000);
															$(this).css({'display':'none','z-index':1})
														});
											}
										}
										$(indexImage).css({'display':'block', 'opacity':1});
										currentImage = indexImage;
										currentIndex = index;
										$('#thumbs li').removeClass('active');
										$($('#thumbs li')[index]).addClass('active');
									}
							}

							function showNext(){
									var len = $('#bigPic img').length;
									var next = currentIndex < (len-1) ? currentIndex + 1 : 0;
									showImage(next);
							}

							var myTimer;

							$(document).ready(function() {
								myTimer = setTimeout("showNext()", 3000);
								showNext(); //loads first image
								$('#thumbs li').bind('click',function(e){
											var count = $(this).attr('rel');
											showImage(parseInt(count)-1);
									});
							});

							$('#window').bPopup({
								modalClose: false,
								position: [150, 100],
								opacity: 0.6,
								scrollBar: true,
								positionStyle: 'fixed',
							});
				}
	});
}

$('#signup').on('click',function() {
	$(location).attr('href', 'http://127.0.0.1:3000/signup');
});
$('#mypage').on('click',function() {
	$(location).attr('href', 'http://127.0.0.1:3000/myPage');
});
$('#logout').on('click',function() {
	$(location).attr('href', 'http://127.0.0.1:3000/logout');
});
$('#login').on('click',function() {
	$(location).attr('href', 'http://127.0.0.1:3000/login');
});
