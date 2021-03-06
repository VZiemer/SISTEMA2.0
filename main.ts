import { app, BrowserWindow, screen, dialog  } from "electron";
import * as log from "electron-log";
import { autoUpdater } from "electron-updater"
import * as path from "path";
import * as url from "url";
import * as fs from "fs";


export default class AppUpdater {
  constructor() {
    const log = require("electron-log")
    log.transports.file.level = "debug"
    autoUpdater.logger = log
    autoUpdater.checkForUpdatesAndNotify()
  }
}

autoUpdater.logger = require("electron-log")




let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === "--serve");

function createWindow() {
  const electronScreen = screen;
  const size = electronScreen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (serve) {
    require("electron-reload")(__dirname, {
      electron: require(`${__dirname}/node_modules/electron`)
    });
    win.loadURL("http://localhost:4200");
  } else {
    win.loadURL(
      url.format({
        pathname: path.join(__dirname, "dist/index.html"),
        protocol: "file:",
        slashes: true
      })
    );
  }

  if (serve) {
    win.webContents.openDevTools();
  }
  // win.webContents.openDevTools();
  // Emitted when the window is closed.
  win.on("closed", () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  win.webContents.on(
    "new-window",
    (event, url, frameName, disposition, options, additionalFeatures) => {
      if (frameName === "impressao") {
        //abre a janela de impressão
        // open window as modal
        event.preventDefault();
        event.newGuest = new BrowserWindow({
          minimizable: false,
          movable: true,
          width: 800,
          height: 1000,
          fullscreen: false,
          enableLargerThanScreen: true,
          skipTaskbar: true,
          autoHideMenuBar: true,
          webPreferences: {
            nativeWindowOpen: true
          }
        });
        event.newGuest.loadURL("file://c:/temp/teste.html");
        event.newGuest.webContents.on("did-finish-load", () => {
          // Use default printing options
          event.newGuest.webContents.print({
            silent: false,
            printBackground: true,
            deviceName: ""
          });
        });
      }
    }
  );
}
autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 seconds, then quit and install
  // In your application, you don't need to wait 5 seconds.
  // You could call autoUpdater.quitAndInstall(); immediately

  const window = BrowserWindow.getFocusedWindow();

  const options = {
    type: 'question',
    buttons: [ 'Sim', 'Com Certeza'],
    defaultId: 2,
    title: 'Atualização',
    message: 'A atualização está pronta, deseja reiniciar',
    detail: 'Você não tem escolha',
  };
  dialog.showMessageBox(window, options).then(response => { autoUpdater.quitAndInstall(); });

  // setTimeout(function() {
  //   autoUpdater.quitAndInstall();  
  // }, 5000)
})

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.on('ready', function()  {


    autoUpdater.checkForUpdates();
  });
  
  app.on("ready", createWindow);


  



  // Quit when all windows are closed.
  app.on("window-all-closed", () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== "darwin") {
      app.quit();
    }
  });

  app.on("activate", () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  });
} catch (e) {
  // Catch Error
  // throw e;
}
