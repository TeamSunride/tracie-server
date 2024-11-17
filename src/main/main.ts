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
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import { usb, getDeviceList, findByIds } from 'usb';
const devices: usb.Device[] = getDeviceList();
console.log(devices);

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

usb.on('attach', (device) => {
  console.log('New USB device connected:', device);
  // You can access device descriptors and start communication here
  console.log('Vendor ID:', device.deviceDescriptor.idVendor);
  console.log('Product ID:', device.deviceDescriptor.idProduct);
  console.log('Available interfaces:', device.interfaces);

  // Open the device for communication
  switch (device.deviceDescriptor.idVendor) {
    case 0x05ac:
      // Apple Inc.
      const currentDevice = findByIds(
        device.deviceDescriptor.idVendor,
        device.deviceDescriptor.idProduct,
      );
      if (currentDevice) {
        currentDevice.open();
        currentDevice.controlTransfer(
          0x80, // bmRequestType
          0x06, // bRequest: GET_DESCRIPTOR
          0x0100, // wValue: Descriptor Type (Device=0x01) and Index (0)
          0x0000, // wIndex: Language ID (0 for Device Descriptor)
          64, // data_or_length: Number of bytes to request
          (error, data) => {
            // Callback
            if (error) {
              console.error('Error in control transfer:', error);
            } else {
              console.log('Device Descriptor:', data);
              console.log(currentDevice.interfaces);
              if (currentDevice.interfaces) {
                const iface = currentDevice.interfaces[0];

                if (iface) {
                  if (iface.isKernelDriverActive()) iface.detachKernelDriver();

                  iface.claim();

                  console.log('Connected to iPhone!');
                }
              }
            }
            currentDevice.close();
          },
        );
      } else {
        console.error('Device not found');
      }
    default:
      throw new Error('Unsupported device');
  }
});

// Watch for device removal
usb.on('detach', (device) => {
  console.log('USB device removed:', device);
});

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

  const getAssetPath = (...paths: string[]): string => {
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
