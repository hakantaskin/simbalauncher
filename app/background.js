// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import { app, Menu } from 'electron';
import { devMenuTemplate } from './helpers/dev_menu_template';
import { editMenuTemplate } from './helpers/edit_menu_template';
import createWindow from './helpers/window';
var Autorun = require('autorun');
var autorun = new Autorun('Simbalauncher', '"C:\\Simbalauncher\\Simbalauncher.exe"');

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

var auto_run = function (){
  // Check if platform is supported
  if (autorun.isPlatformSupported()) {
    // Check if autorun is enabled using callback
    autorun.isSet(function(err, enabled) {
      if (err) console.log(err);
      console.log('Autorun is ' + ((enabled) ? 'enabled' : 'disabled'));
      // Toogle autorun using promises
      if (!enabled) {
        autorun.enable()
        .then(function() {
          console.log('Autorun enabled');
        })
        .catch(function(err) {
          console.log('Error enabling autorun', err);
        });
      }
    });
  }
}

app.on('ready', function () {
    auto_run();
    setApplicationMenu();

    var mainWindow = createWindow('main', {
        width: 1000,
        height: 600,
        show: false
    });

    mainWindow.loadURL('file://' + __dirname + '/app.html');
    mainWindow.on('close', function (main_event){
      main_event.preventDefault();
    });
    if (env.name !== 'production') {
        mainWindow.openDevTools();
    }
});

app.on('window-all-closed', function () {
    app.quit();
});
