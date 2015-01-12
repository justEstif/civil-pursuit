! function () {

  'use strict';

  var gulp          =   require('gulp');
  var path          =   require('path');
  var config        =   require('../config.json');
  var minifyCSS     =   require('gulp-minify-css');
  var rename        =   require("gulp-rename");

  exports.task      =   function gulpMinifyCSSDashboard () {
    return gulp.src(path.join(process.cwd(), config.files['dashboard css']))
      .pipe(minifyCSS())
      .pipe(rename(function (path) {
        path.extname = '.min.css';
      }))
      .pipe(gulp.dest(config.dirs['dist css']));
  };

}();
