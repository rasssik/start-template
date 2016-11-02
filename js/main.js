$(document).ready(function ($) {
	$body = $('body');
	windowWidth = $(window).width();
	windowHeight = $(window).height();

	//developer funcitons
	pageWidget(['index', 'blog', 'news', 'about_us', 'contact']);
	getAllClasses('html','.elements_list');
});
