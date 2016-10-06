#! /usr/bin/env node
var mkdirp = require('mkdirp');
var colors = require('colors');
var fs = require('fs');
var path = require('path');
var getDirName = require('path').dirname;
var regExp = /\{\s?'([^'\s?}]+)\'\s?}/g;

function fromDir(startPath,filter,callback){

    if (!fs.existsSync(startPath)){
        console.log('No Directory Provided'.red);
        return;
    }

    var files=fs.readdirSync(startPath);
    for(var i=0;i<files.length;i++){
        var filename=path.join(startPath,files[i]);
        var stat = fs.lstatSync(filename);
        if (stat.isDirectory()){
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

if (process.argv[2] && process.argv[2]) {
  console.log('Importing from ' + process.argv[2].yellow);

  fromDir(process.argv[2],/\.html$/,function(filename){
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
        var exportPath = filename.replace(process.argv[2], process.argv[3]);
        console.log('Exporting to ' + exportPath.yellow);
        writeFile(exportPath, contents);
      });
  });
} else {
  console.log('Please run juice-pack with import and export directories, for example: "juice-pack templates/ exports/"'.red);
}

