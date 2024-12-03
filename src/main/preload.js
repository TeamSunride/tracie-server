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
  cancelBluetoothRequest: () => ipcRenderer.send('cancel-bluetooth-request'),
  bluetoothPairingRequest: (callback) =>
    ipcRenderer.on('bluetooth-pairing-request', () => callback()),
  bluetoothPairingResponse: (response) =>
    ipcRenderer.send('bluetooth-pairing-response', response),
  startAdvertising: (name, serviceUuids, callback) => ipcRenderer.send('start-advertising', name, serviceUuids, callback),
  onNavigate: (callback) => {
    const subscription = (_event, ...args) => callback(...args);
    ipcRenderer.on('navigate', subscription);
  },
  // bleno: {
  //   startAdvertising: (name, serviceUuids, callback) => {
  //     bleno.startAdvertising(name, serviceUuids, callback);
  //   },
  //   stopAdvertising: () => {
  //     bleno.stopAdvertising();
  //   },
  //   setServices: (services) => {
  //     bleno.setServices(services);
  //   },
  //   on: (event, callback) => {
  //     bleno.on(event, callback);
  //   },
  // },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
