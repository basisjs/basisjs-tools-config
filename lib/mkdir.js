var path = require('path');
var fs = require('fs');
var MODE = parseInt('0777', 8) & ~process.umask();

module.exports = function mkdir(dir){
  dir = path.resolve(dir);

  try {
    fs.mkdirSync(dir, MODE);
  } catch(e) {
    if (e.code == 'ENOENT')
    {
      mkdir(path.dirname(dir));
      mkdir(dir);
    }
    else
    {
      // In the case of any other error, just see if there's a dir
      // there already. If so, then hooray! If not, then something
      // is borked.
      try {
        if (fs.statSync(dir).isDirectory())
          return;
      } catch(x) {}

      throw e;
    }
  }
};
