gulp = require 'gulp'
gutil = require 'gulp-util'
config = require './gulpconfig.coffee'
plugins = require('gulp-load-plugins')()
jshintReporter = require 'jshint-stylish'


gulp.task 'default', ['lint','build']

gulp.task 'build', [
  'install'
  'js'
]

hasRunInstall = false
gulp.task 'install', () ->
  return if hasRunInstall
  hasRunInstall = true
  return plugins.bower()

gulp.task 'js', ['install'], () ->
  gulp.src(config.files.js.app)
  .pipe(errorHandler())
  .pipe(plugins.sourcemaps.init({loadMaps: true}))
  .pipe(plugins.uglify())
  .pipe(plugins.sourcemaps.write('./'))
  .pipe(gulp.dest(config.output.jsDir))

gulp.task 'lint', ['install'], () ->
  gulp.src(config.files.js.app)
    .pipe(errorHandler())
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(config.jshint.reporter))

gulp.task 'watch', ['default'], (done) ->
  gulp.watch config.files.js.app, {debounceDelay: 2000}, ['lint','js']

  done()


# Utilities
onError = (err) ->
  gutil.log(gutil.colors.red err)
  @emit 'end'

errorHandler = () ->
  plugins.plumber {errorHandler: onError}
