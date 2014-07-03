/*-----------------------------------------------------
 * livereload Default Setting
 *-----------------------------------------------------*/
'use strict';
var path = require('path');
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;

/*-----------------------------------------------------
 * Module Setting
 *-----------------------------------------------------*/
module.exports = function (grunt) {

    var banner = '/*!\n' +
        ' * ====================================================\n' +
        ' * <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? " * " + pkg.homepage + "\\n" : "" %>' +
        ' * GitHub: <%= pkg.repository.url %> \n' +
        ' * Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
        ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
        ' * ====================================================\n' +
        ' */\n\n',
        buildPath = 'import.js',
        srcPath = 'src/',
        distPath = 'dist/';

    var getPath = function (readFile) {

        var sources = require("fs").readFileSync(readFile);
        sources = /paths\s=\s\[([\s\S]*?)\]/ig.exec(sources);
        sources = sources[1].replace(/\/\/.*\n/g, '\n').replace(/'|"|\n|\t|\s/g, '');
        sources = sources.split(",");
        sources.forEach(function (filepath, index) {
            sources[index] = srcPath + filepath;
        });

        return sources;

    };

    // Project configuration.
    grunt.initConfig({

        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        concat: {
            js: {
                options: {
                    banner: banner + '(function(kity, window) {\n\n',
                    footer: '\n\n})(kity, window)',
                    process: function (src, filepath) {
                        return src + "\n";
                    }
                },
                src: getPath(buildPath),
                dest: distPath + 'kityminder.all.js'
            }
        },
        uglify: {
            minimize: {
                options: {
                    banner: banner
                },
                files: (function () {
                    var files = {};
                    files[distPath + 'kityminder.all.min.js'] = distPath + 'kityminder.all.js';
                    return files;
                })()
            }
        },
        copy: {
            dir: {
                files: [{
                    src: ['dialogs/**', 'lang/**', 'lib/**', 'social/**', 'themes/**', 'index.html', 'download.php'],
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
                    src: ['LICENSE', 'favicon.ico', 'README.md'],
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
                    to: 'src="$1.js?_=' + +new Date() + '"'
                }]
            }
        },

        /* Start [Task liverload] ------------------------------------*/
        livereload: {
            port: 35729 // Default livereload listening port.
        },
        connect: {
            livereload: {
                options: {
                    hostname: '*',
                    port: 9001,
                    base: '.',
                    middleware: function (connect, options, middlewares) {
                        return [
                            lrSnippet,
                            connect.static(options.base.toString()),
                            connect.directory(options.base.toString())
                        ];
                    }
                }
            }
        },
        regarde: {
            js: {
                files: 'src/**/*.js',
                tasks: ['default', 'livereload']
            }
        }
        /* End [Task liverload] ------------------------------------*/

    });

    // These plugins provide necessary tasks.
    /* [Build plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-text-replace');


    /* [liverload plugin & task ] ------------------------------------*/
    grunt.loadNpmTasks('grunt-regarde');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-livereload');

    // Build task(s).
    grunt.registerTask('default', ['concat', 'uglify', 'copy', 'replace']);
    grunt.registerTask('live', ['livereload-start', 'connect', 'regarde']);

};