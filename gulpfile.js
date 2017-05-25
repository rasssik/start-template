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
var minify = require("gulp-minify");
var imagemin = require("gulp-imagemin");

var html5Lint = require("gulp-html5-lint");
var stylelint = require("stylelint");
var postcss_scss = require("postcss-scss");
var reporter = require("postcss-reporter");

var svgSprite = require("gulp-svg-sprite");
var svgmin = require("gulp-svgmin");
var cheerio = require("gulp-cheerio");
var replace = require("gulp-replace");

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

// svg sprite build
gulp.task("svgSpriteBuild", function() {
	return gulp.src("app/img/icons/*.svg")
		// minify svg
		.pipe(svgmin({
			js2svg: {
				pretty: true
			}
		}))
		// remove all fill and style declarations
		.pipe(cheerio({
			run: function($) {
				$("[fill]").removeAttr("fill");
				$("[stroke]").removeAttr("stroke");
				$("[style]").removeAttr("style");
			}
		}))
		// cheerio plugin create unnecessary string '>', so replace it.
		.pipe(replace("&gt;", ">"))

		// build svg sprite
		.pipe(svgSprite({
			mode: {
				symbol: {
					sprite: "../sprite.svg",
					render: {
						scss: {
							dest: "../../../../sass/helpers/_sprite.scss",
							template: "app/sass/helpers/_sprite-template.scss"
						}
					},
					example: true
				}
			}
		}))
		.pipe(gulp.dest("app/img/icons/sprite/"));
});

// build task (start)
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

// optimization and format CSS
gulp.task("style-min", ["copy"], function() {
	return gulp.src("app/css/*.css")
		.pipe(csso({
			restructure: false,
			sourceMap: true,
			debug: true
		}))
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
	gulp.src("app/img/*")
		.pipe(imagemin())
		.pipe(gulp.dest("build/img/"));
});
// build task (end)

// testing your build files
gulp.task("html5-lint", function() {
	return gulp.src("build/**/*.html")
		.pipe(html5Lint());
});

// css linting
gulp.task("linting", function() {
	return gulp.src(["app/sass/**/*.scss", '!' + "app/sass/helpers/*.scss"])
		.pipe(postcss(
			[
				stylelint(),
				reporter({
					clearMessages: true
				})
			], {
				syntax: postcss_scss
			}
		));
});

// tasks
gulp.task("build", ["clean", "copy", "typograf", "style-min", "js-min", "img-min"], function() {});
gulp.task("validation", ["html5-lint"]);
gulp.task("cssLint", ["linting"]);
gulp.task("svgSprite", ["svgSpriteBuild"]);
