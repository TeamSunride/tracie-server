import { RADIUS_OF_EARTH } from '../util/constants';
import { radToDeg } from '../util/conversions';
import UnscentedKalmanFilter from './kalmanFilter';

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

  private kalmanFilter: UnscentedKalmanFilter;

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
    this.kalmanFilter = new UnscentedKalmanFilter();
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

    this.kalmanFilter.predict(timeMilliseconds);

    this.kalmanFilter.update(longitude, latitude, altitude, timeMilliseconds);

    const { x, y, z, vx, vy, vz, ax, ay, az, pitch, yaw, pitchRate, yawRate } =
      this.kalmanFilter.getState();

    this.position = { x, y, z };
    this.velocity = { x: vx, y: vy, z: vz };
    this.acceleration = { x: ax, y: ay, z: az };
    this.orientation = { pitch, yaw };
    this.angularVelocity = { pitch: pitchRate, yaw: yawRate };

    const dt = (timeMilliseconds - this.lastGpsUpdateMilliseconds) / 1000;

    // Update total distance traveled
    const dx = vx * dt;
    const dy = vy * dt;
    const dz = vz * dt;
    this.totalDistanceTraveled += Math.sqrt(dx * dx + dy * dy + dz * dz);

    this.lastGpsUpdateMilliseconds = timeMilliseconds;
  }

  public getAltitude(): number {
    return this.position.z;
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
    const { x, y } = this.position;
    const { longitude: initialLongitude, latitude: initialLatitude } =
      this.initialPosition;

    const R = RADIUS_OF_EARTH; // Radius of the Earth in meters

    const deltaLatitude = radToDeg(y / R);
    const deltaLongitude = radToDeg(
      x / R / Math.cos((initialLatitude * Math.PI) / 180),
    );

    return {
      longitude: initialLongitude + deltaLongitude,
      latitude: initialLatitude + deltaLatitude,
    };
  }
}
