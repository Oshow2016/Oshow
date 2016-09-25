function showInfo(id,pw) {
	$.ajax({
		url: 'http://127.0.0.1:3000/getInfo',
		dataType: 'json',
		type: 'POST',
		data: {'customer_id':id,
						'customer_pw':pw},
		success: function(result) {
			var htmlString = "";
			if ( result.result == true ) {
				$('#id').html(result.id);
				$('#pw').html(result.pw);
			}
		},
		error:function(request,status,error) {
			window.alert(request.status);
		}
	});
}
