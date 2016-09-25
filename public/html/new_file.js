/**
 * @author 황정우
 */
/*
 var p = $("#picture");
 var position = p.position();

$('.table').each(function(){
		var x = $(this).css("left");
		var y = $(this).css("top");
		var xPx = x.substr(0,x.length-2);
		var yPx = y.substr(0,y.length-2);
		xPx = parseInt(xPx);
		yPx = parseInt(yPx);
		$(this).css({"left":xPx+30,"top":yPx+30});
});*/

$('.table').each(function(){
	$(this).css("border","none");
});

$('.table').on('mouseover',function(e){
	$(this).css("border","5px solid red");
});

$('.table').on('mouseout',function(e){
	$(this).css("border","none");
});

$('.table').on('click',function(e){
	$('.table').css("background","none");
	$(this).css("background","#fff");
});
