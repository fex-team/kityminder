/*global module:false*/
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
        buildPath = 'dist/dev.php';

    var getPath = function ( readFile) {

            var sources = require("fs").readFileSync(readFile);
            sources = /Array\(([^)]+)\)/.exec( sources );
            sources = sources[1].replace( /\/\/.*\n/g, '\n' ).replace( /'|"|\n|\t|\s/g, '' );
            sources = sources.split( "," );
            sources.forEach( function ( filepath, index ) {
                sources[ index ] = filepath;
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
                    process: function(src, filepath) {
                        return src + "\n";
                    }
                },
                src: getPath( buildPath ),
                dest: 'dist/kityminder.all.js'
            }

        },

        uglify: {

            options: {

            },

            minimize: {

                files: {
                    'dist/kityminder.all.min.js': 'dist/kityminder.all.js'
                }

            }

        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    // Default task.
    grunt.registerTask( 'default', [ 'concat:js', 'uglify:minimize' ] );

};
