var gulp = require('gulp');
var sass = require('gulp-sass');
var cleanCSS = require('gulp-clean-css');
var rename = require('gulp-rename');

gulp.task('watch', function() {
  gulp.watch('public/sass/profile/profile.scss')
  .on('change', function(file){
    gulp.src('public/sass/profile/profile.scss').pipe(sass()) // gulp-sass module - converts sass to css
    .pipe(rename({dirname: ''}))
    .pipe(cleanCSS())
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('public/css/min'));
    console.log("Gulp! Delicious.");
  });
});
