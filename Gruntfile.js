module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-bower-task');

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

  bower: {
      install: {
        options: {
          targetDir: './lib',
          layout: 'byType',
          install: true,
          verbose: false,
          cleanTargetDir: false,
          cleanBowerDir: true
        }
      }
    }
  });

  grunt.registerTask('default', ['bower']);
};