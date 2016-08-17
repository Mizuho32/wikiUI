var gulp = require("gulp");
var bower = require('main-bower-files');
var concat = require("gulp-concat");
var filter = require("gulp-filter");
var uglify = require("gulp-uglify")
var rename = require("gulp-rename");
var less = require("gulp-less");
var minify = require("gulp-minify-css");

gulp.task("js", function(){
	var js_filter = filter(["**/asciidoctor-all.min.js", "**/opal.js"],{restore:true});
  console.log( bower() );
	gulp.src( bower() )
		.pipe( js_filter )
		.pipe( gulp.dest('src/clients/js/lib') );
  gulp.src("bower_components/ace-builds/src/**")
		.pipe( gulp.dest('src/clients/js/lib/ace') );
  gulp.src("bower_components/vue/dist/vue.min.js")
		.pipe( gulp.dest('src/clients/js/lib') );
});

gulp.task("bowercss", function(){
	var css_filter = filter("*.css", {restore: true});
	var less_filter = filter("*.less", {restore: true});
	var libdir = "css/raw"

	gulp.src(bower())
		.pipe( css_filter )
		.pipe( 
			rename({
				prefix: "_",
				extname:".css"
			})
		)
		.pipe( gulp.dest(libdir) )
		.pipe( css_filter.restore )
		.pipe( less_filter )
		.pipe( less() )
		.pipe( 
			rename({
				prefix: "_",
				extname: ".css"
			})
		)
		.pipe( gulp.dest(libdir) )
		.pipe( less_filter.restore );
});

gulp.task("cssmin", ["bowercss"], function(){
	var cssdir = "css/";
	var libdir = "css/raw/";

	gulp.src(libdir + "_*.css")
		.pipe( concat("_bundle.css") )
		.pipe( gulp.dest(cssdir) )
		.pipe( minify() )
		.pipe( 
			rename({
				extname: ".min.css"
			})
		)
		.pipe( gulp.dest(cssdir) );
});
