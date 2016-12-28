"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync");
var mqpacker = require("css-mqpacker");
var rename = require("gulp-rename");
var clean = require("gulp-clean");
var cleanCSS = require("gulp-clean-css");
var image = require("gulp-image");
var minify = require("gulp-minify");

// sass task
gulp.task("style", function() {
	gulp.src("sass/style.scss")
		.pipe(plumber())
		.pipe(sass())
		.pipe(postcss([
			autoprefixer({
				browsers: ["last 4 versions"]
			}),
			mqpacker({
				sort: true
			})
		]))
		.pipe(gulp.dest("css"))
		.pipe(server.reload({
			stream: true
		}));
});

// server task
gulp.task("serve", ["style"], function() {
	server.init({
		server: ".",
		notify: false,
		open: true,
		ui: false
	});

	gulp.watch("sass/**/*.{scss,sass}", ["style"]);
	gulp.watch("*.html").on("change", server.reload);
});

// build task (start)
gulp.task("clean", function() {
	return gulp.src("build", {
			read: false
		})
		.pipe(clean());
});

gulp.task("copy", ["clean"], function() {
	gulp.src("*.html").pipe(gulp.dest("build"));
	gulp.src("fonts/**/*.{woff,woff2}").pipe(gulp.dest("build/fonts"));
	gulp.src("img/**/*.{png,jpg,gif,svg}").pipe(gulp.dest("build/img"));
	gulp.src("js/**/*.js").pipe(gulp.dest("build/js"));
	gulp.src("css/**/*.css").pipe(gulp.dest("build/css"));
});

// minify files
gulp.task("style-min", function() {
	return gulp.src("css/*.css")
		.pipe(cleanCSS({compatibility: "ie8", debug: true}, function(details) {
    		console.log(details.name + ": "  + details.stats.originalSize);
        console.log(details.name + ": " + details.stats.minifiedSize);
    }))
    .pipe(cleanCSS({compatibility: "ie8"}))
		.pipe(rename({
			suffix: ".min"
		}))
    .pipe(gulp.dest("build/css"));
});

gulp.task("img-min", function() {
	gulp.src("img/**/*")
		.pipe(image())
		.pipe(gulp.dest("build/img/"));
});

gulp.task("js-min", function() {
	gulp.src("js/*.js")
		.pipe(minify({
			ext: {
				min: ".min.js"
			},
		}))
		.pipe(gulp.dest("build/js"))
});

// build task (final)
gulp.task("build", [
	"clean",
	"copy",
	"style-min",
	"img-min",
	"js-min",
], function() {});
