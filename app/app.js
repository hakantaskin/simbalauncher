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
var simba_launcher_path = 'C:\\Simbalauncher\\';
var downloading = false;

var set_version = function (version){
  fs.writeFile( simba_launcher_path + txtfile, version, (err) => {
    if (err){
      error_log(err);
    } else {
      info_log("new version : " + version);
      setTimeout(function(){
        info_log("Simba executer activate");
        simba_executer = 1;
      }, 40000);
    }
  });
}

var download_file = function (remote_version){
  info_log('download start remote version: ' + remote_version);
  download(env.simba_download_url).then(function(stream) {
    try {
        downloading = true;
        var writeStream = fs.createWriteStream(simba_launcher_path + zipfile);
        stream.pipe(writeStream);
        writeStream.on('finish', function(){
          info_log("Zip download finished");
          simba_kill();
        });
        writeStream.on('error', function(stream_error){
          error_log("Stream_error : " + stream_error);
        });
    } catch(e) {
        error_log("Download : " + e);
    }
  });
}

var sync_new_version = function (){
  exec('cd ' + simba_launcher_path + ' && unzip.exe -eo simba_latest.zip', (err, stdout, stderr) => {
    if (err) {
      error_log(err);
    } else {
      downloading = false;
      info_log('unzip');
      set_version(remote_version);
    }
  });
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
  info_log("Simba.exe execute start function");
  exec('tasklist /fo:csv /fi "imagename eq Simba.exe"', (err, stdout, stderr) => {
    if (err) {
      error_log(err);
    } else {
      var processid = "";
      var match_result = stdout.match(/"Simba.exe","(.*?)","Console"/g);
      if (match_result == null) {
        fs.stat(simba_launcher_path + 'Simba', (directory_err, stats) => {
          if (directory_err){
            info_log("Simba directory not found!");
          } else{
            simba_exe_run('cd ' + simba_launcher_path + 'Simba && Simba.exe');
          }
        });
      }
      else {
       info_log("Simba.exe is running.");
     }
    }
  });
  info_log("Simba.exe execute finish function");
}

var simba_exe_run = function(command){
  if(simba_executer == 1){
    exec(command, (execute_err, stdout, stderr) => {
      if(execute_err){
          error_log(execute_err);
      } else {
          info_log("Simba.exe execute. Command: " + command);
      }
    });
  } else {
      info_log("Simba_exe_run function = Error: Simba executer status = 0");
  }
}

var simba_kill = function (){
  exec('taskkill /f /fi "imagename eq Simba.exe"', (err, stdout, stderr) => {
    if (err) {
      error_log(err);
    } else {
      sync_new_version();
      info_log("Simba.exe kill");
    }
  });
}

var run = function (){
  if(os.platform() != 'darwin' && simba_executer == 1){
    simba_execute();
  }
  fs.readFile(simba_launcher_path + txtfile, function read(err, data) {
    if (err) {
      fs.writeFile(simba_launcher_path + txtfile, "", (err) => {
        info_log(err);
      });
    } else {
      local_version = data;
      http.get(env.version_url, (res) => {
        res.on("data", function(chunk) {
          remote_version = chunk;
          if (local_version.toString() != remote_version.toString()){
              simba_executer = 0;
              if(downloading == false){
                  download_file(remote_version);
              }
          }
        });
      }).on('error', (e) => {
        info_log('Got error: ' + e);
      });
    }
  });
}

run();

setInterval(function(){
  run();
}, 300000);
