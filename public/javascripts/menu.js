$("input[name='no_menu']").click(function(){
	$("input[class='menu']:checkbox").each(function(){
		$(this).prop('checked',false);
	});
});

$("input[class='menu']:checkbox").click(function(){
	$("input[name='no_menu']:checkbox").each(function(){
		$(this).prop('checked',false);
	});
});