// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  setGroundstationChannel: (channel) => {
    ipcRenderer.send('set-groundstation-channel', channel);
  },
  onSerialPortConnected: (callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on('serial-port-connected', subscription);
  },
  onSerialPortDisconnected: (callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on('serial-port-disconnected', subscription);
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
