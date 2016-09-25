/**
 * @author 황정우
 */

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
	alert($(this).attr('id'));
});
