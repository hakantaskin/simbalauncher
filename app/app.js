// Here is the starting point for your application code.
// All stuff below is just to show you how it works. You can delete all of it.

// Use new ES6 modules syntax for everything.
import os from 'os'; // native node.js module
import { remote } from 'electron'; // native electron module
import jetpack from 'fs-jetpack'; // module loaded from npm
import env from './env';
const http = require('http');
const fs = require('fs');
var assert = require('assert');
var promise = require('bluebird');
var url = require('url');
var extract = require('extract-zip');
import { error_log, info_log } from './helpers/quick';
const child_process = require('child_process');
const exec = child_process.exec;
const execFile = child_process.execFile;
const spawn = child_process.spawn;
var simba_executer = 1;

var app = remote.app;
var appDir = jetpack.cwd(app.getAppPath());
var local_version = "";
var remote_version = "";
var txtfile = 'last_version.txt';
var zipfile = 'simba_latest.zip';

var set_version = function (version){
  fs.writeFile('./' + txtfile, version, (err) => {
    if (err) throw err;
  });
}

var download_file = function (remote_version){
  info_log('download start remote version: ' + remote_version);
  download(env.simba_download_url).then(function(stream) {
    try {
        var writeStream = fs.createWriteStream(zipfile);
        stream.pipe(writeStream);
        simba_kill();
        sync_new_version();
        set_version(remote_version);
        simba_executer = 1;
        simba_execute();
    } catch(e) {
        error_log("" + e);
    }
  });
}

var sync_new_version = function (){
  try {

    extract(zipfile, {dir: ''}, function (err) {
    // extraction is complete. make sure to handle the err
      if (err){
        error_log("extract throw : " + err);
        throw err;
      }
      info_log('unzip')
    });
  } catch(e){
      error_log("extract error log : " + e);
  }
}

function download(option) {
    assert(option);
    if (typeof option == 'string') {
        option = url.parse(option);
    }

    return new promise(function(resolve, reject) {
        var req = http.request(option, function(res) {
            if (res.statusCode == 200) {
                resolve(res);
            } else {
                if (res.statusCode === 301 && res.headers.location) {
                    resolve(download(res.headers.location));
                } else {
                    reject(res.statusCode);
                }
            }
        })
        .on('error', function(e) {
            reject(e);
        })
        .end();
    });
}

var simba_execute = function (){
  exec('tasklist /fo:csv /fi "imagename eq Simba.exe"', (err, stdout, stderr) => {
    if (err) {
      error_log(err);
      return;
    }
    var processid = "";
    var match_result = stdout.match(/"Simba.exe","(.*?)","Console"/g);
    if (match_result == null) {
      exec('cd Simba && Simba.exe', function(err, data) {
        if(err){
            error_log(err);
        }
     });
   } else {
     console.log("Simba.exe is running.");
   }
  });
}

var simba_kill = function (){
  exec('taskkill /fi "imagename eq Simba.exe"', (err, stdout, stderr) => {
    if (err) {
      error_log(err);
      return;
    }
    simba_executer = 0;
  });
}

var run = function (){
  fs.readFile('./' + txtfile, function read(err, data) {
    if (err) {
      fs.writeFile('./' + txtfile, "", (err) => {
        if (err) throw err;
      });
    } else {
      local_version = data;
      http.get(env.version_url, (res) => {
      res.on("data", function(chunk) {
        remote_version = chunk;
        if (local_version.toString() != remote_version.toString()){
            download_file(remote_version);
        }
      });
      }).on('error', (e) => {
        error_log(`Got error: ${e.message}`)
      });
      if(os.platform() != 'darwin' && simba_executer == 1){
        simba_execute();
      }
    }
  });
}

run();

setInterval(function(){
  run();
}, 60000);
