import { SerialPort } from 'serialport';
import { EventEmitter } from 'events';

class Port {
  private port: SerialPort;

  public readonly info: PortInfo;

  constructor(info: PortInfo) {
    this.info = info;
  }

  public connect({ baudRate }: { baudRate: number }) {
    this.port = new SerialPort({ path: this.info.path, baudRate });
  }

  public write(data: string) {
    this.port.write(data);
  }

  public on(event: string, callback: (data: any) => void) {
    this.port.on(event, callback);
  }
}

export default class SerialPortManager extends EventEmitter {
  private oldSerialPorts: PortInfo[] = [];

  private serialPortPollingInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
  }

  public startSerialPortPolling() {
    if (!this.serialPortPollingInterval) {
      this.serialPortPollingInterval = setInterval(() => {
        SerialPort.list().then((newSerialPorts) => {
          const addedPorts = newSerialPorts.filter(
            (newPort) =>
              !this.oldSerialPorts.some(
                (oldPort) => oldPort.path === newPort.path,
              ),
          );
          const removedPorts = this.oldSerialPorts.filter(
            (oldPort) =>
              !newSerialPorts.some((newPort) => newPort.path === oldPort.path),
          );

          addedPorts.forEach((port) => {
            this.emit('portAdded', new Port(port));
          });

          removedPorts.forEach((port) => {
            this.emit('portRemoved', new Port(port));
          });

          this.oldSerialPorts = newSerialPorts;
        });
      }, 1000);
    }
  }

  public stopSerialPortPolling() {
    clearInterval(this.serialPortPollingInterval as NodeJS.Timeout);

    this.serialPortPollingInterval = null;
  }
}
