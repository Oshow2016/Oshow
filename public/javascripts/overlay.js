function overlay() {
	el = document.getElementById("overlay");
	first = document.getElementById("reservation_choose_date");
	no_menu = document.getElementById('reservation_no_menu_checkbox');

	first.checked = "ture";
	no_menu.checked = "ture";
	el.style.visibility = (el.style.visibility == "visible") ? "hidden" : "visible";
}

