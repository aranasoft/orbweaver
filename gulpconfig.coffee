pkg = require './package.json'


output =
  jsDir:  'dist'


files =
  js:
    app: 'src/**/*.js'

module.exports =
  output: output
  files:  files
