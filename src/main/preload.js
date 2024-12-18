// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel, func) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
  onReadRequest: (callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on('ble-read-request', subscription);
  },
  invokeBleReadRequestCallback: (callbackId, data) => {
    // allows renderer to respond to a read request, although currently only the main process responds to read requests
    ipcRenderer.send('invoke-ble-read-request-callback', callbackId, data);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
