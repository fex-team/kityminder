/*-----------------------------------------------------
 * livereload Default Setting
 *-----------------------------------------------------*/
'use strict';
var path = require('path');

/*-----------------------------------------------------
 * Module Setting
 *-----------------------------------------------------*/
module.exports = function(grunt) {

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-less');
    grunt.loadNpmTasks('grunt-postcss');
    grunt.loadNpmTasks('grunt-autoprefixer');

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

    var packs = ['index', 'edit', 'share', 'm-share'];
    var sources = require('./import.js');
    var srcPath = 'src/';
    var distPath = 'dist/';

    var distPages = ['index', 'edit', 'viewshare', 'm-share'].map(function(name) {
        return distPath + name + '.html';
    });

    var concatConfigs = {};

    packs.forEach(function(pack) {
        concatConfigs[pack] = {
            options: {
                banner: banner + '(function(window) {\n\n',
                footer: '\n\n})(window)',
                sourceMap: true,
                sourceMapStyle: 'link'
            },
            src: sources.filter(function(source) {
                return source.pack == '*' || source.pack.split('|').indexOf(pack) !== -1;
            }).map(function(source) {
                return source.path;
            }),
            dest: distPath + 'kityminder.' + pack + '.js'
        };
    });

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        clean: ['dist'],

        concat: concatConfigs,

        uglify: {
            minimize: {
                options: {
                    banner: banner,
                    sourceMap: true
                },
                files: (function() {
                    var files = {};
                    packs.forEach(function(pack) {
                        files[distPath + 'kityminder.' + pack + '.min.js'] = distPath + 'kityminder.' + pack + '.js';
                    });
                    return files;
                })()
            }
        },

        copy: {
            dir: {
                files: [{
                    src: [
                        'ui/theme/**/css/*.css',
                        'ui/theme/**/css/*.css.map',
                        'ui/theme/**/images/*',
                        'lang/**/*',
                        'static/**/*',
                        'lib/ZeroClipboard.swf',
                        'lib/inflate.js',
                        'lib/source-map.min.js',
                        'index.html',
                        'edit.html',
                        'viewshare.html',
                        'm-share.html',
                        'download.php'
                    ],
                    dest: distPath
                }]
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
                src: distPages,
                overwrite: true,
                replacements: [{
                    from: /import\.js\?pack=([\w-]+)\"/,
                    to: 'kityminder.$1.min.js"'
                }]
            },

            noCache: {
                src: distPages,
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
                tasks: ['less:compile', 'autoprefixer']
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

        autoprefixer: {
            all: {
                options: {
                    map: true
                },
                src: 'ui/theme/default/css/default.all.css',
                dest: 'ui/theme/default/css/default.all.css'
            }
        }

    });


    // Build task(s).
    grunt.registerTask('default', ['clean', 'concat', 'uglify', 'less', 'autoprefixer', 'copy', 'replace']);
    grunt.registerTask('dev', ['less', 'autoprefixer', 'watch']);

};