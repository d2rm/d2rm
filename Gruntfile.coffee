module.exports = (grunt) ->
  buildPlatforms = parseBuildPlatforms(grunt.option('platforms'))
  packageJson = grunt.file.readJSON('package.json')

  d2rmVersion = packageJson.version
  grunt.log.writeln 'Building ' + packageJson.version

  grunt.initConfig
    clean: ['build/releases/**']

    copy:
      main:
        files: [
          src: 'parser/dist/stats-0.1.0.jar'
          dest: 'build/D2RM/linux32/parser/dist/stats-0.1.0.jar'
          flatten: true
        ,
          src: 'parser/dist/stats-0.1.0.jar'
          dest: 'build/D2RM/linux64/parser/dist/stats-0.1.0.jar'
          flatten: true
        ]

    coffee:
      compileBare:
        options:
          bare: true
        files:
          'js/app.js': ['coffee/_l10n.coffee',
                        'coffee/_theme.coffee',
                        'coffee/_windowManager.coffee',
                        'coffee/_settings.coffee',
                        'coffee/_settingsPanel.coffee',
                        'coffee/_matchlist.coffee',
                        'coffee/_sidebar.coffee',
                        'coffee/_playlist.coffee',
                        'coffee/app.coffee',
                        'coffee/_*.coffee']

    concat:
      dist:
        src: ['js/app.js', 'coffee/_*.js']
        dest: 'js/app.js'

    jshint:
      files: ['coffee/_*.js']
      options:
        globals:
          console: true
          document: true

    compass:
      dist:
        options:
          cssDir: 'css'
        files:
          'css/app.css': 'sass/app.sass'

    uglify:
      target:
        files:
          'js/app.js': 'js/app.js'

    cssmin:
      minify:
        files:
          'css/app.css': 'css/app.css'

    shell:
      runnw:
        options:
          stdout: true
        command: [
          '.\\cache\\0\.8\.6\\win\\nw.exe . --debug'
        ].join('&')

    'regex-replace':
      windows_installer:
        src: ['dist/win/windows-installer.iss']
        actions:
          name: 'version'
          search: '#define AppVersion "[\.0-9]+"'
          replace: '#define AppVersion "' + d2rmVersion + '"'

    nodewebkit:
      options:
        version: '0.8.6'
        build_dir: './build'
        mac_icns: './images/icon.icns'
        mac: buildPlatforms.mac
        win: buildPlatforms.win
        linux32: buildPlatforms.linux32
        linux64: buildPlatforms.linux64
      src: ['./views/**', './css/**', './fonts/**', './images/**', './js/**', './l10n/**', './node_modules/**', '!./node_modules/grunt*/**', '!./node_modules/coffeelint/**', './index.html', './splash.html', './package.json', './constants.json', './abilities.json']

    compress:
      linux32:
        options:
          mode: 'tgz'
          archive: 'build/releases/D2RM/linux32/D2RM-' + d2rmVersion + '.tgz'
        expand: true
        cwd: 'build/D2RM/linux32/'
        src: '**'
      linux64:
        options:
          mode: 'tgz'
          archive: 'build/releases/D2RM/linux64/D2RM-' + d2rmVersion + '.tgz'
        expand: true
        cwd: 'build/D2RM/linux64/'
        src: '**'

    coffeelint:
      options: {'max_line_length': {'level': 'warn'}}
      app: ['coffee/*.coffee']

  grunt.loadNpmTasks 'grunt-contrib-clean'
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-compass'
  grunt.loadNpmTasks 'grunt-contrib-uglify'
  grunt.loadNpmTasks 'grunt-contrib-cssmin'
  grunt.loadNpmTasks 'grunt-shell'
  grunt.loadNpmTasks 'grunt-regex-replace'
  grunt.loadNpmTasks 'grunt-node-webkit-builder'
  grunt.loadNpmTasks 'grunt-contrib-compress'
  grunt.loadNpmTasks 'grunt-coffeelint'
  grunt.loadNpmTasks 'grunt-contrib-concat'
  grunt.loadNpmTasks 'grunt-contrib-jshint'
  grunt.loadNpmTasks 'grunt-contrib-copy'

  grunt.registerTask 'default', ['compass', 'coffeelint', 'jshint', 'coffee', 'concat']
  grunt.registerTask 'obfuscate', ['uglify', 'cssmin']
  grunt.registerTask 'nodewkbuild', ['nodewebkit']
  grunt.registerTask 'run', ['default', 'shell:runnw']
  grunt.registerTask 'build', ['default', 'obfuscate', 'clean', 'regex-replace', 'nodewkbuild', 'copy', 'compress']

parseBuildPlatforms = (argumentPlatform) ->

  # this will make it build no platform when the platform option is specified
  # without a value which makes argumentPlatform into a boolean
  inputPlatforms = argumentPlatform or process.platform + ';' + process.arch

  # Do some scrubbing to make it easier to match in the regexes bellow
  inputPlatforms = inputPlatforms.replace('darwin', 'mac')
  inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, '')
  buildAll = /^all$/.test(inputPlatforms)
  buildPlatforms =
    mac: /mac/.test(inputPlatforms) or buildAll
    win: /win/.test(inputPlatforms) or buildAll
    linux32: /linux32/.test(inputPlatforms) or buildAll
    linux64: /linux64/.test(inputPlatforms) or buildAll

  buildPlatforms
