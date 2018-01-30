const electron = require('electron')

// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

global.CONFIG = require('./config.json');;

// register flash plugin
const develop = false
let asarDir = '../app.asar.unpacked/plugins/';
if (develop) {
  asarDir = '.';
}
let pluginName = 'pepflashplayer32_28_0_0_126.dll'
const flashplayer = path.join(__dirname, asarDir + pluginName)
app.commandLine.appendSwitch('ppapi-flash-path', flashplayer);
app.commandLine.appendSwitch('ppapi-flash-version', '28.0.0.126');

app.setLoginItemSettings({
  openAtLogin: true
})

// app.disableHardwareAcceleration()
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win

let win_disp2
// TOTAL WIDTH OF 1ST SCREEN DISPLAY AND 2ND SCREEN DISPLAY
let total_width = 0

function createWindow() {
  // 1ST SCREEN DISPLAY
  let primaryDisplay = electron.screen.getPrimaryDisplay()
  total_width += primaryDisplay.bounds.width
  const { width, height } = primaryDisplay.workAreaSize
  win = new BrowserWindow({ 
    width: width, 
    height: height, 
    frame: false, 
    fullscreen: true,
    webPreferences: { // essential for plugins load
      plugins: true
    } 
  })
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // win.webContents.on('paint', (event, dirty, image) => {
  //   // updateBitmap(dirty, image.getBitmap())
  // })

  // Emitted when the window is closed.
  win.on('closed', function () {
    win_disp2 = null
    win = null
    app.quit()
  })

  // THE 2ND SCREEN DISPLAY
  let displays = electron.screen.getAllDisplays()
  let externalDisplay = displays.find((display) => {
    return display.bounds.x !== 0 || display.bounds.y !== 0
  })
  if (externalDisplay) {
    total_width += externalDisplay.bounds.width
    //const { width_2, height_2 } = externalDisplay.workAreaSize

    win_disp2 = new BrowserWindow({
      x: externalDisplay.bounds.x,
      y: externalDisplay.bounds.y,
      width: total_width,
      height: 1080,
      fullscreen: true,
      frame: false
    })
    win_disp2.loadURL(url.format({
      pathname: path.join(__dirname, 'videoAd.html'),
      protocol: 'file:',
      slashes: true
    }))
    win_disp2.on('closed', function () {
      win_disp2 = null
      win = null
      app.quit()
    })
  }
  // END

}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.