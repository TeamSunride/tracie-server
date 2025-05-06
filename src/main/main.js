/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { randomUUID } from 'crypto';
import { ReadlineParser } from 'serialport';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { BLEEvent } from '../ble';
import {
  addDatapoint,
  getDatapoints,
  getMostRecentDatapoint,
} from '../database/runtime/datapointManager';
import SerialPortManager from '../serial';
import { parseRawData } from '../data';
import Rocket from '../positioning/rocket';

const bleReadRequestCallbacks = new Map();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow = null;

let rocketTracking = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths) => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
    titleBarStyle: 'hidden',
  });

  mainWindow.webContents.session.setPermissionCheckHandler(
    (webContents, permission, requestingOrigin, details) => {
      if (permission === 'serial' && details.securityOrigin === 'file:///') {
        return true;
      }

      return false;
    },
  );

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'serial' && details.origin === 'file://') {
      return true;
    }

    return false;
  });

  BLEEvent.on('readRequest', (callback) => {
    console.log('READ REQUEST (event)');
    if (mainWindow) {
      const callbackId = randomUUID();
      console.log('generated callback id', callbackId);
      bleReadRequestCallbacks.set(callbackId, callback);
      console.log('sending read request to renderer');
      mainWindow.webContents.send('ble-read-request', callbackId);
      const data = JSON.stringify(rocketTracking);
      ipcMain.emit('invoke-ble-read-request-callback', null, callbackId, data);
    }
  });

  BLEEvent.on('acceptConnection', (clientAddress) => {
    console.log('CONNECTED (event)');
    if (mainWindow) {
      mainWindow.webContents.send('ble-connected', clientAddress);
    }
  });

  ipcMain.on('invoke-ble-read-request-callback', (event, callbackId, data) => {
    console.log('INVOKE CALLBACK');
    const callback = bleReadRequestCallbacks.get(callbackId);
    if (callback) {
      callback(data);
      bleReadRequestCallbacks.delete(callbackId);
    }
  });

  setTimeout(() => {
    console.log('adding datapoint');
    addDatapoint(
      53.364502,
      -1.5139229,
      205.0939941,
      3,
      24,
      1716840343,
      -67.0,
      10.75,
      101165.594,
      0,
    );

    setTimeout(() => {
      console.log('getting datapoints');
      const datapoints = getDatapoints({ limit: 1 });
      console.log(datapoints);
      setTimeout(() => {
        const lastDatapoint = getMostRecentDatapoint();
        console.log(lastDatapoint);
      }, 1000);
    }, 5000);
  }, 5000);

  setTimeout(() => {
    const lastDatapoint = getMostRecentDatapoint();
    console.log(lastDatapoint);
  }, 1000);

  const serialPortManager = new SerialPortManager();
  serialPortManager.startSerialPortPolling();
  serialPortManager.on('portAdded', (port) => {
    console.log('PORT ADDED', port);
    if (port.info.vendorId === '10c4' && port.info.productId === 'ea60') {
      console.log('found device');
      // serialPortManager.stopSerialPortPolling();
      rocketTracking = new Rocket({});
      port.connect({
        baudRate: 115200,
      });
      const parser = new ReadlineParser();
      port.port.pipe(parser);
      parser.on('data', (data) => {
        console.log('DATA RECEIVED', data);
        try {
          const parsed = parseRawData(data);
          console.log('PARSED DATA', parsed);
          if (parsed.radioState !== '0') return;
          addDatapoint(
            parsed.latitude,
            parsed.longitude,
            parsed.altitude,
            parsed.fix,
            parsed.siv,
            Date.now(),
            parsed.rssi,
            parsed.snr,
            parsed.freqError,
            parsed.radioState,
          );
        } catch (error) {
          console.error('error parsing data', error);
        }
      });
      ipcMain.on('set-groundstation-channel', (event, channel) => {
        console.log('SET GROUNDSTATION CHANNEL', channel);
        // send data over serial port
        port.port.write(channel === 1 ? "CHANNEL1" : "CHANNEL2");
      });
      mainWindow.webContents.send('serial-port-connected');
    }
  });
  serialPortManager.on('portRemoved', (port) => {
    console.log('PORT REMOVED', port);
    if (port.info.vendorId === '10c4' && port.info.productId === 'ea60') {
      console.log('device removed');
      // serialPortManager.startSerialPortPolling();
      mainWindow.webContents.send('serial-port-disconnected');
    }
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app
  .whenReady()
  .then(() => {
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
