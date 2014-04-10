// Karma configuration
// Generated on Wed Oct 09 2013 19:20:49 GMT+0800 (中国标准时间)

module.exports = function(config) {
//    var base_path = '../';
  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: '../',


    // frameworks to use
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
       'spec/tools/js/UserAction.js'
        ,'spec/SpecHelper.js'
        ,'kity/dist/kitygraph.all.js'
        ,'lib/jquery-2.1.0.min.js'
        ,'lib/jquery.xml2json.js'

        ,'src/core/kityminder.js'
        ,'src/core/utils.js'
        ,'src/core/command.js'
        ,'src/core/node.js'
        ,'src/core/module.js'
        ,'src/core/event.js'
        ,'src/core/minder.js'
        ,'src/core/minder.data.js'
        ,'src/core/minder.event.js'
        ,'src/core/minder.module.js'
        ,'src/core/minder.command.js'
        ,'src/core/minder.node.js'
        ,'src/core/keymap.js'
        ,'src/core/minder.lang.js'
        ,'src/core/minder.defaultoptions.js'
        ,'src/module/geometry.js'
        ,'src/module/history.js'
        ,'src/module/icon.js'
        ,'src/module/layout.js'
        ,'src/module/layout.default.js'
        ,'src/module/layout.bottom.js'
        ,'src/core/minder.select.js'
        ,'src/module/view.js'
        ,'src/module/dragtree.js'
        ,'src/module/dropfile.js'
        ,'src/module/keyboard.js'
        ,'src/module/select.js'
        ,'src/module/history.js'
        ,'src/module/editor.js'
        ,'src/module/editor.range.js'
        ,'src/module/editor.receiver.js'
        ,'src/module/editor.selection.js'
        ,'src/module/basestyle.js'
        ,'src/module/font.js'
        ,'src/module/zoom.js'
        ,'src/ui/jquery-ui-1.10.4.custom.min.js'
        ,'src/ui/widget.js'
        ,'src/ui/button.js'
        ,'src/ui/toolbar.js'
        ,'src/ui/menu.js'
        ,'src/ui/dropmenu.js'
        ,'src/ui/splitbutton.js'
        ,'src/ui/colorsplitbutton.js'
        ,'src/ui/popup.js'
        ,'src/ui/scale.js'
        ,'src/ui/colorpicker.js'
        ,'src/ui/combobox.js'
        ,'src/ui/buttoncombobox.js'
        ,'src/ui/modal.js'
        ,'src/ui/tooltip.js'
        ,'src/ui/tab.js'
        ,'src/ui/separator.js'
        ,'src/ui/scale.js'
        ,'src/adapter/utils.js'
        ,'src/adapter/adapter.js'
        ,'src/adapter/button.js'
        ,'src/adapter/combobox.js'
        ,'src/adapter/saveto.js'
        ,'src/adapter/view.js'
        ,'src/adapter/tooltips.js'
        ,'src/adapter/layout.js'
        ,'src/adapter/node.js'
        ,'src/adapter/contextmenu.js'
        ,'src/adapter/dialog.js'
        ,'src/protocal/xmind.js'
        ,'src/protocal/freemind.js'
        ,'src/protocal/mindmanager.js'
        ,'src/protocal/plain.js'
        ,'src/protocal/json.js'
        ,'src/protocal/png.js'
        ,'src/protocal/svg.js'
        ,'spec/core/*.js'
        ,'spec/module/*.js'
        ,'spec/protocal/*.js'

    ],


    // list of files to exclude
    exclude: [
        'karma.conf.js'
    ],


    // test results reporter to use
    // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
//    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['Firefox','Chrome'],//,'Chrome'


    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,


    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true,
    //coverage
      reporters: ['progress', 'coverage','junit'],
          preprocessors: {
              'src/core/*.js': ['coverage'],
              'src/adapter/*.js': ['coverage'],
              'src/module/*.js': ['coverage'],
              'src/protocal/*.js': ['coverage'],
              'src/ui/*.js': ['coverage']
          }
      ,
    coverageReporter: {
          type: 'text',
          dir: 'spec/coverage/json_files/'
    }
      ,
      junitReporter: {
          outputFile: 'spec/test-results.xml'
      }
  });
};
