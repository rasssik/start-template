"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var server = require("browser-sync");

var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var html = require("gulp-rigger");

var typograf = require("gulp-typograf");
var rename = require("gulp-rename");
var clean = require("gulp-clean");
var csso = require("gulp-csso");
var csscomb = require("gulp-csscomb");
var stylefmt = require("gulp-stylefmt");
var image = require("gulp-image");
var minify = require("gulp-minify");

// sass task
gulp.task("style", function() {
	gulp.src("app/sass/style.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer({
				browsers: ["last 5 versions"]
			}),
			mqpacker({
				sort: true
			})
		]))
		.pipe(gulp.dest("app/css"))
		.pipe(server.reload({
			stream: true
		}));
});

// html build task
gulp.task("html", function() {
	gulp.src("app/pages/*.html")
		.pipe(html())
		.pipe(gulp.dest("app"))
		.pipe(server.reload({
			stream: true
		}));
});

// browser-sync task
gulp.task("serve", ["style", "html"], function() {
	server.init({
		server: "./app",
		notify: false,
		open: true,
		ui: false
	});

	gulp.watch("app/sass/**/*.{scss,sass}", ["style"]);
	gulp.watch("app/pages/**/*.*", ["html"]);
	gulp.watch("app/js/*.js").on("change", server.reload);
});

// build task
// (start)
gulp.task("clean", function() {
	return gulp.src("app/build", {
			read: false
		})
		.pipe(clean());
});

gulp.task("copy", ["clean"], function() {
	gulp.src("app/fonts/**/*.{woff,woff2,eot,ttf}").pipe(gulp.dest("build/fonts"));
	gulp.src("app/*.html").pipe(gulp.dest("build"));
	gulp.src("app/img/**/*.{png,jpg,gif,svg}").pipe(gulp.dest("build/img"));
	gulp.src("app/js/**/*.js").pipe(gulp.dest("build/js"));
	gulp.src("app/css/**/*.css").pipe(gulp.dest("build/css"));
});

// prepare texts
gulp.task("typograf", ["copy"], function() {
	gulp.src("app/*.html")
		.pipe(typograf({
			locale: ['ru', 'en-US']
		}))
		.pipe(gulp.dest("build/"));
});

// пока исключено!
// gulp.task("style-lint", function() {
// 	return gulp.src("app/css/*.css")
// 		.pipe(csscomb())
// 		.pipe(gulp.dest("build/css/"));
// });

// optimization and format CSS
gulp.task("style-min", ["copy"], function() {
	return gulp.src("app/css/*.css")
		.pipe(csso({
			restructure: false,
			sourceMap: true,
			debug: true
		}))
		// .pipe(stylefmt())
		.pipe(gulp.dest("build/css/"));
});

gulp.task("js-min", function() {
	gulp.src("app/js/*.js")
		.pipe(minify({
			ext: {
				min: ".min.js"
			},
		}))
		.pipe(gulp.dest("build/js/"))
});

gulp.task("img-min", function() {
	gulp.src("app/img/**/*")
		.pipe(image())
		.pipe(gulp.dest("build/img/"));
});

// build task
// (final)
gulp.task("build", ["clean", "copy", "typograf", "style-min", "js-min", "img-min"], function() {});
