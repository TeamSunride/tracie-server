import { radToDeg } from '../util/conversions';

export default class Rocket {
  public position: { x: number; y: number; z: number }; // worth noting that this is in metres, and is relative to the initial position

  public velocity: { x: number; y: number; z: number };

  public acceleration: { x: number; y: number; z: number };

  public orientation: { pitch: number; yaw: number };

  public angularVelocity: { pitch: number; yaw: number };

  public initialPosition: {
    longitude: number;
    latitude: number;
    altitude: number;
  };

  public startTimeMilliseconds: number;

  public totalDistanceTraveled: number = 0; // in metres

  public maxAltitude: number = 0;

  public maxVerticalSpeed: number = 0;

  public altitude: number = 0;

  public longitude: number = 0;

  public latitude: number = 0;

  private lastGpsUpdateMilliseconds: number | undefined;

  constructor({
    longitude,
    latitude,
    altitude,
  }: {
    longitude: number;
    latitude: number;
    altitude: number;
  }) {
    // set the initial state to be 0, 0, 0
    this.position = { x: 0, y: 0, z: 0 };
    this.velocity = { x: 0, y: 0, z: 0 };
    this.acceleration = { x: 0, y: 0, z: 0 };
    this.orientation = { pitch: 0, yaw: 0 };
    this.angularVelocity = { pitch: 0, yaw: 0 };
    this.initialPosition = { longitude, latitude, altitude };
    this.startTimeMilliseconds = Date.now();
  }

  gpsPositionUpdate(
    longitude: number,
    latitude: number,
    altitude: number,
    timeMilliseconds: number,
  ): void {
    if (!this.lastGpsUpdateMilliseconds) {
      this.lastGpsUpdateMilliseconds = timeMilliseconds;
      return;
    }

    this.altitude = altitude;
    this.longitude = longitude;
    this.latitude = latitude;

    if (this.altitude > this.maxAltitude) {
      this.maxAltitude = this.altitude;
    }

    this.lastGpsUpdateMilliseconds = timeMilliseconds;
  }

  public getSpeed(): number {
    const { x, y, z } = this.velocity;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  }

  public getDistanceTravelled(): number {
    return this.totalDistanceTraveled;
  }

  public getFlightTime(): number {
    return (Date.now() - this.startTimeMilliseconds) / 1000;
  }

  public getVerticalSpeed(): number {
    return this.velocity.z;
  }

  public getHorizontalSpeed(): number {
    const { x, y } = this.velocity;
    return Math.sqrt(x ** 2 + y ** 2);
  }

  public getTrajectoryAngle(): number {
    const { x, y, z } = this.velocity;
    return radToDeg(Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)));
  }

  public getAccelerationMagnitude(): number {
    const { x, y, z } = this.acceleration;
    return Math.sqrt(x ** 2 + y ** 2 + z ** 2);
  }

  public getLongitudeAndLatitude(): { longitude: number; latitude: number } {
    return {
      longitude: this.longitude,
      latitude: this.latitude,
    };
  }

  public toJSON() {
    return {
      altitude: this.altitude,
      flightTime: this.getFlightTime(),
      longitudeAndLatitude: this.getLongitudeAndLatitude(),
      maxAltitude: this.maxAltitude,
      maxVerticalSpeed: this.maxVerticalSpeed,
    };
  }
}
