var fs = require('fs');
var simba_lanucher_path = 'C:\\Simbalauncher\\';
export var error_log = function (log) {
  var date = new Date().toISOString();
  fs.appendFile( simba_lanucher_path + 'error_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  console.error(log);
  });
}

export var info_log = function (log) {
  var date = new Date().toISOString();
  fs.appendFile(simba_lanucher_path + 'info_log.txt', "[ "+ date +" ] " + log + "\r\n", (err) => {
  console.log(log);
  });
}
