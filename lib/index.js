var fs = require('fs');
var path = require('path');
var ConfigStore = require('./config-store');
var globalConfig;


//
// global config
//

function getGlobalConfig(){
  if (!globalConfig)
    globalConfig = new ConfigStore('basisjs-tools');

  return globalConfig;
}


//
// project config
//

function fetchConfig(filename){
  var data;

  filename = path.resolve(filename);

  try {
    data = fs.readFileSync(filename, 'utf-8');
  } catch(e) {
    console.error('Config read error: ' + e);
    process.exit(2);
  }

  try {
    data = JSON.parse(data);
  } catch(e) {
    console.error('Config parse error: ' + e);
    process.exit(2);
  }

  return {
    filename: filename,
    path: path.dirname(filename),
    data: data
  };
}

function fetchFromPackageJson(filename) {
  var data = require(filename).basisjsConfig;

  if (!data)
    return;

  return {
    filename: filename,
    path: path.dirname(filename),
    data: data
  };
}

function searchConfig(){
  var currentDir = process.env.PWD || process.cwd(); // use PWD if possible as on *nix process.cwd()
                                                     // returns real path instead of symlink-path;
  var pathParts = path.normalize(currentDir).split(path.sep);

  while (pathParts.length)
  {
    var cfgFile = pathParts.join(path.sep) + path.sep + 'basis.config';
    var packageJsonFile = pathParts.join(path.sep) + path.sep + 'package.json';
    var config;

    if (fs.existsSync(cfgFile))
      config = fetchConfig(cfgFile);
    else
      if (fs.existsSync(packageJsonFile))
        config = fetchFromPackageJson(packageJsonFile);

    if (config)
      return config;

    pathParts.pop();
  }
}

module.exports = function(command){
  command
    .option('-n, --no-config', 'Don\'t use basis.config', { hot: true, beforeInit: true })
    .option('-c, --config-file <filename>', 'Specify path to config filename', { hot: true, beforeInit: true });

  Object.defineProperty(command, 'globalConfig', {
    enumerable: true,
    get: getGlobalConfig
  });

  command.getConfig = function(options){
    if (!options)
      options = this.values || {};

    if ('config' in options == false || options.config)
    {
      var config = options.configFile
        ? fetchConfig(options.configFile)
        : searchConfig();

      if (config)
        return config;
    }
  };

  return command;
};
