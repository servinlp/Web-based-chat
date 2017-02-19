module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    sass: {
      dist: {
        files: [{
          'style.css' : 'style.scss'
        },
        {
        expand: true,
        cwd: 'styles',
        src: ['*.scss'],
        dest: '../scss',
        ext: '.css'
      }]
      }
    },
    watch: {
      css: {
        files: ['*.scss', 'public/scss/*.scss', 'public/scss/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true
        }
      },
      html: {
        files: 'public/scss/*.html',
        options: {
          livereload: true
        }
      },
      jade: {
        files: 'views/*.jade',
        options: {
          livereload: true
        }
      },
      js: {
        files: '*.js',
        options: {
          livereload: true
        }
      }
    }
  });
  grunt.loadNpmTasks('grunt-contrib-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerTask('default', ['watch']);
}
