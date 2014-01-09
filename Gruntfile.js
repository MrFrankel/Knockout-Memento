module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        plato: {
            your_task: {
                files: {
                    'reports': ['src/*.js']
                }
            }
        },
        qunit: {
            all: {
                options: {
                    urls: [
                        'http://localhost:8000/index.html'
                    ]
                }
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base:'.'
                }
            }
        },
        dom_munger: {
            readjs: {
                options: {
                    read: {selector:'script[data-pr="true"]',attribute:'src',writeto:'myJsRefs',isPath:true}
                },
                src: 'index.html'
            },
            updatePR:{
                options: {
                    update: {selector:'script[data-pr="true"]',attribute:'src', value:'../../dist/<%= pkg.name %>-v<%= pkg.version %>.js'}
                },
                src: 'demos/view/rectangle.html'  //update the dist/index.html (the src index.html is copied there)
            }
        },
        concat: {
            options: {
                // define a string to put between each file in the concatenated output
            },
            dist: {
                // the files to concatenate
                src: ['<%= dom_munger.data.myJsRefs %>'],
                // the location of the resulting JS file
                dest: 'dist/<%= pkg.name %>.js'
            }
        },
        watch: {
            files: ['Src/*.js'],
            tasks: ['connect', 'qunit']
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'dist/<%= pkg.name %>.js',
                dest: 'dist/<%= pkg.name %>-v<%= pkg.version %>.js'
            }
        },
        jshint: {
            // define the files to lint
            files: ['gruntfile.js','<%= dom_munger.data.myJsRefs %>'],
            // configure JSHint (documented at http://www.jshint.com/docs/)
            options: {
                // more options here if you want to override JSHint defaults
                globals: {
                    jQuery: true,
                    console: true,
                    module: true
                }
            }
        },
        jsdoc : {
            dist : {
                src: ['src/*.js'],
                options: {
                    destination: 'docs',
                    private:true
                }
            }
        }

    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-qunit');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-dom-munger');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-plato');
    grunt.loadNpmTasks('grunt-jsdoc');

    grunt.registerTask('test', ['karma', 'plato']);
    grunt.registerTask('docs', ['jsdoc']);
// the default task can be run just by typing "grunt" on the command line
    grunt.registerTask('default', ['jsdoc','plato', 'dom_munger', 'jshint',  'concat','uglify']);

};