var fs = require('fs');
var regExp = /\{\s?'([^'\s?}]+)\'\s?}/g;

console.log('Importing from ' + process.argv[2]);

fs.readFile(process.argv[2], 'utf8', function(err, contents) {
  var matches = [];
  if (err) {
    return console.log(err);
  }
  var match = regExp.exec(contents);
  while (match != null) {
      matches.push(match);
      match = regExp.exec(contents);
  }
  for (var i = 0; i < matches.length; i++) {
    var match = matches[i];
    var patialContent = fs.readFileSync('../example/' + match[1], 'utf8');
      contents = contents.replace(match[0], patialContent);
      console.log('Replaced url ' + match[1]);
  }
  console.log('Exporting to ' + process.argv[3]);
  fs.writeFileSync(process.argv[3], contents, 'utf8');
});

console.log('Kikating...');