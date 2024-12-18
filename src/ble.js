import bleno from 'bleno';
import { EventEmitter } from 'events';

export const BLEEvent = new EventEmitter();

export const serviceId = 'B370';

class NavigateCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'B371',
      properties: ['read', 'write'],
      value: null,
    });
  }

  onWriteRequest(data, _offset, _withoutResponse, callback) {
    console.info('BLE WRITE REQUEST');
    callback(this.RESULT_SUCCESS);
  }

  onReadRequest(_offset, callback) {
    console.info('BLE READ REQUEST');
    BLEEvent.emit('readRequest', (text) => {
      const data = Buffer.from(text);
      callback(this.RESULT_SUCCESS, data.slice(_offset));
    });
  }
}

bleno.on('stateChange', (state) => {
  if (state === 'poweredOn') {
    bleno.startAdvertising('TracieServer', [serviceId]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', (error) => {
  if (!error) {
    bleno.setServices([
      new bleno.PrimaryService({
        uuid: serviceId,
        characteristics: [new NavigateCharacteristic()],
      }),
    ]);
  }
});

// this is not useful, since it doesn't work on macOS, we instead detect connections by listening for read requests
// bleno.on('accept', (clientAddress) => {
//   console.log(`Accepted connection from ${clientAddress}`);
//   BLEEvent.emit('acceptConnection', clientAddress);
// });
