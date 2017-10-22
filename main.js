#! /usr/bin/env node
var mkdirp = require('mkdirp');
var colors = require('colors');
var pretty = require('pretty');
var fs = require('fs');
var path = require('path');
var watch = require('node-watch');
var getDirName = require('path').dirname;
var program = require('commander');
var regExp = /\{\s?'([^'\s?}]+)\'\s?}/g;

function fromDir(startPath, filter, callback){

    if (!fs.existsSync(startPath)){
        console.log('No Directory Provided'.red);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory() && !program.noRecurse){
            fromDir(filename,filter,callback); //recurse
        }
        else if (filter.test(filename)) callback(filename);
    };
};

function writeFile(path, contents, cb) {
  mkdirp(getDirName(path), function (err) {
      if (err) return cb(err);
      fs.writeFile(path, contents, cb);
      console.log('Saved to ' + path.cyan);
  });
}

function compileFiles() {
    fromDir(process.argv[2], /\.html$/, function(filename){
        fs.readFile(filename, 'utf8', function(err, contents) {
        var matches = [];
        if (err) {
          return console.log(err.red);
        }
        var match = regExp.exec(contents);
        while (match != null) {
            matches.push(match);
            match = regExp.exec(contents);
        }
        for (var i = 0; i < matches.length; i++) {
          var match = matches[i];
          var patialContent = fs.readFileSync(process.argv[2].replace(/\/?$/, '/') + match[1], 'utf8');
            contents = contents.replace(match[0], patialContent);
            console.log('Replaced url ' + match[1].cyan);
        }
        if (process.argv[2] === '.' || process.argv[2] === './') {
          var exportPath = path.normalize(process.argv[3]) + filename;
        } else {
          var exportPath = filename.replace(path.normalize(process.argv[2]), path.normalize(process.argv[3]));
        }
        contents=pretty(contents);
        console.log('Exporting to ' + exportPath.yellow);
        writeFile(exportPath, contents);
      });
  });
}

program
  .version('0.0.1')
  .option('-w, --watch', 'Watch Files')
  .option('--nr, --noRecurse', 'Disable recurse subdirectories')
  .parse(process.argv);

if (process.argv[2] && process.argv[3]) {
  console.log('Importing from ' + process.argv[2].yellow);
  compileFiles();
} else {
  console.log('Please run juice-pack with import and export directories, for example: "juice-pack templates/ exports/"'.red);
}

if (program.watch) {
  console.log('Watching file changes...');
  watch(process.argv[2], function(filename) {
    console.log(filename, ' changed.');
    compileFiles();
  });
}


