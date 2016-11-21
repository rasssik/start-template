$(document).ready(function ($) {
	$body = $('body');
	windowWidth = $(window).width();
	windowHeight = $(window).height();

	//developer funcitons
	pageWidget(['index', 'blog', 'news', 'about_us', 'contact']);
	getAllClasses('html','.elements_list');
});

// back to top
$("#back-top").hide();

$(window).scroll(function() {
	if ($(this).scrollTop() > 100) {
		$("#back-top").fadeIn();
	} else {
		$("#back-top").fadeOut();
	}
});

$("#back-top").click(function() {
	$("body,html").animate({
		scrollTop: 0
	}, 500);
	return false;
});
