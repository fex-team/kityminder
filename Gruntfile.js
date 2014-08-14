/*-----------------------------------------------------
 * livereload Default Setting
 *-----------------------------------------------------*/
'use strict';
var path = require('path');

/*-----------------------------------------------------
 * Module Setting
 *-----------------------------------------------------*/
module.exports = function(grunt) {

    var banner = '/*!\n' +
        ' * ====================================================\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository.url %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' * ====================================================\n' +
        ' */\n\n';

    var sources = require('./import.js');
    var srcPath = 'src/',
        distPath = 'dist/';

    console.log(sources);

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js: {
                options: {
                    banner: banner + '(function(kity, window) {\n\n',
                    footer: '\n\n})(kity, window)',
                    process: function(src, filepath) {
                        return src + '\n';
                    }
                },
                src: sources,
                dest: distPath + 'kityminder.all.js'
            }
        },

        uglify: {
            minimize: {
                options: {
                    banner: banner
                },
                files: (function() {
                    var files = {};
                    files[distPath + 'kityminder.all.min.js'] = distPath + 'kityminder.all.js';
                    return files;
                })()
            }
        },

        copy: {
            dir: {
                files: [{
                    src: ['ui/theme/**', 'index.html', 'download.php'],
                    dest: distPath
                }]
            },
            kity: {
                expand: true,
                cwd: 'kity/dist/',
                src: '**',
                dest: distPath + 'lib/'
            },
            km_config: {
                expand: true,
                src: 'kityminder.config.js',
                dest: distPath
            },
            mise: {
                files: [{
                    src: ['LICENSE', 'favicon.ico', 'README.md', 'CHANGELOG.md'],
                    dest: distPath
                }]
            }
        },

        replace: {
            online: {
                src: distPath + 'index.html',
                overwrite: true,
                replacements: [{
                    from: /kity\/dist\/kity\.js/ig,
                    to: 'lib/kity.min.js'
                }, {
                    from: /import\.js/,
                    to: 'kityminder.all.min.js'
                }]
            },

            noCache: {
                src: distPath + 'index.html',
                overwrite: true,
                replacements: [{
                    from: /src=\"(.+?)\.js\"/ig,
                    to: 'src="$1.js?_=' + (+new Date()) + '"'
                }]
            }
        },

        watch: {
            less: {
                files: ['ui/theme/**/*.less'],
                tasks: ['less:compile']
            }
        },

        less: {
            compile: {
                files: {
                    'ui/theme/default/css/default.all.css': [
                        'ui/theme/default/css/import.less'
                    ]
                },
                options: {
                    sourceMap: true,
                    sourceMapFilename: 'ui/theme/default/css/default.all.css.map',
                    sourceMapBasepath: 'ui/theme/default/css/'

                }
            }
        },

    });

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');

    // Build task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'copy', 'replace']);
    grunt.registerTask('dev', ['less', 'watch']);

};