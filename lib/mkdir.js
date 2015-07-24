var MODE = parseInt('0777', 8) & ~process.umask();
var path = require('path');
var fs = require('fs');

module.exports = function mkdir(dir){
  dir = path.resolve(dir);

  try {
    if (fs.statSync(dir).isDirectory())
      return;
  } catch(x) {}

  try {
    fs.mkdirSync(dir);
  } catch(e) {
    if (e.code != 'ENOENT')
      throw e;

    mkdir(path.dirname(dir));
    mkdir(dir);
  }
};
