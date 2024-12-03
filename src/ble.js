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
    const page = data.toString();
    BLEEvent.emit('navigate', page);
    callback(this.RESULT_SUCCESS);
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
