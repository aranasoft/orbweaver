pkg = require './package.json'

isTeamCity = process?.env?.TEAMCITY_VERSION?

output =
  jsDir:  'dist'

files =
  js:
    app: 'src/**/*.js'

module.exports =
  output: output
  files:  files
  jshint:
    reporter:       if (isTeamCity) then 'jshint-teamcity' else 'jshint-stylish'

