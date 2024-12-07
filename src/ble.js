import bleno from 'bleno';
import { EventEmitter } from 'events';

export const BLEEvent = new EventEmitter();

const serviceId = 'B370';

class NavigateCharacteristic extends bleno.Characteristic {
  constructor() {
    super({
      uuid: 'B371',
      properties: ['read', 'write'],
      value: null,
    });
  }

  onWriteRequest(data, _offset, _withoutResponse, callback) {
    console.log("INCOMING DATA");
    const page = data.toString();
    // BLEEvent.emit('navigate', page);
    console.log(page);
    callback(this.RESULT_SUCCESS);
  }

  onReadRequest(_offset, callback) {
    console.log("READ REQUEST");
    const data = Buffer.from('hello world :)');

    callback(this.RESULT_SUCCESS, data.slice(_offset));
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

bleno.on("accept", (clientAddress) => {
  console.log(`Accepted connection from ${clientAddress}`);
});
