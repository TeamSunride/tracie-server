import { haversineDistance } from '../util/conversions';
import {
  createDiagonalMatrix,
  createEmptyMatrix,
  inverse,
  matrixAdd,
  matrixMultiply,
  transpose,
} from '../util/matrix';

/* eslint no-plusplus: ["error", { "allowForLoopAfterthoughts": true }] */
export default class UnscentedKalmanFilter {
  private stateDimension: number;

  private measurementDimension: number;

  private state: number[];

  private covariance: number[][];

  private processNoise: number[][];

  private measurementNoise: number[][];

  private previousLongitude: number | null = null;

  private previousLatitude: number | null = null;

  private previousAltitude: number | null = null;

  private previousTimePredictMilliseconds: number | null = null;

  private previousTimeUpdateMilliseconds: number | null = null;

  constructor() {
    this.stateDimension = 13;
    this.measurementDimension = 5;

    this.state = createEmptyMatrix(this.stateDimension, 1).flat();

    this.state[0] = 0; // x
    this.state[1] = 0; // y
    this.state[2] = 0; // z
    this.state[3] = 0; // vx
    this.state[4] = 0; // vy
    this.state[5] = 0; // vz
    this.state[6] = 0; // ax
    this.state[7] = 0; // ay
    this.state[8] = 0; // az
    this.state[9] = 0; // pitch
    this.state[10] = 0; // yaw
    this.state[11] = 0; // pitch rate
    this.state[12] = 0; // yaw rate

    this.covariance = createDiagonalMatrix(this.stateDimension, 1); // 1, initial uncertainty
    this.processNoise = createDiagonalMatrix(this.stateDimension, 0.1); // 0.1, process noise
    this.measurementNoise = createDiagonalMatrix(this.measurementDimension, 5); // 5, GPS noise
  }

  public predict(newTimeMilliseconds: number): void {
    if (this.previousTimePredictMilliseconds === null) {
      this.previousTimePredictMilliseconds = newTimeMilliseconds;
      return;
    }

    const dt =
      (newTimeMilliseconds - this.previousTimePredictMilliseconds) / 1000;

    // position update
    this.state[0] += this.state[3] * dt + 0.5 * this.state[6] * dt * dt; // x
    this.state[1] += this.state[4] * dt + 0.5 * this.state[7] * dt * dt; // y
    this.state[2] += this.state[5] * dt + 0.5 * this.state[8] * dt * dt; // z

    // velocity update
    this.state[3] += this.state[6] * dt; // x
    this.state[4] += this.state[7] * dt; // y
    this.state[5] += this.state[8] * dt; // z

    // angle update
    this.state[9] += this.state[12] * dt; // pitch
    this.state[10] += this.state[11] * dt; // yaw

    // process noise
    for (let i = 0; i < this.stateDimension; i++) {
      for (let j = 0; j < this.stateDimension; j++) {
        this.covariance[i][j] += this.processNoise[i][j] * dt;
      }
    }
  }

  public update(
    longitude: number,
    latitude: number,
    altitude: number,
    currentTimeMilliseconds: number,
  ): void {
    if (
      this.previousLongitude !== null &&
      this.previousLatitude !== null &&
      this.previousAltitude !== null &&
      this.previousTimeUpdateMilliseconds !== null
    ) {
      const deltaTime =
        (currentTimeMilliseconds - this.previousTimeUpdateMilliseconds) / 1000; // Convert to seconds

      // Calculate distances
      const { dx, dy } = haversineDistance(
        this.previousLatitude,
        this.previousLongitude,
        latitude,
        longitude,
      );
      const distanceZ = altitude - this.previousAltitude;

      // Calculate velocity
      const vx = dx / deltaTime;
      const vy = dy / deltaTime;
      const vz = distanceZ / deltaTime;

      // Calculate acceleration
      const ax = (vx - this.state[3]) / deltaTime;
      const ay = (vy - this.state[4]) / deltaTime;
      const az = (vz - this.state[5]) / deltaTime;

      // Smooth updates (alpha blending)
      const alpha = 0.5;
      this.state[3] += alpha * (vx - this.state[3]);
      this.state[4] += alpha * (vy - this.state[4]);
      this.state[5] += alpha * (vz - this.state[5]);
      this.state[6] += alpha * (ax - this.state[6]);
      this.state[7] += alpha * (ay - this.state[7]);
      this.state[8] += alpha * (az - this.state[8]);

      // Correct covariance based on measurement noise
      const kalmanGain = this.computeKalmanGain();
      for (let i = 0; i < this.stateDimension; i++) {
        for (let j = 0; j < this.stateDimension; j++) {
          // Update covariance based on Kalman gain and measurement noise
          this.covariance[i][j] -=
            kalmanGain[i][j] * this.measurementNoise[i][j];
        }
      }
    }

    // Update previous values
    this.previousLongitude = longitude;
    this.previousLatitude = latitude;
    this.previousAltitude = altitude;
    this.previousTimeUpdateMilliseconds = currentTimeMilliseconds;
  }

  private computeKalmanGain(): number[][] {
    // H is the measurement matrix
    const H = createEmptyMatrix(3, this.stateDimension);
    H[0][0] = 1;
    H[1][1] = 1;
    H[2][2] = 1;

    // R is the measurement noise covariance matrix
    const R = this.measurementNoise;

    // P_pred is the predicted covariance matrix
    const P_pred = this.covariance;

    // Compute the innovation covariance
    const HT = transpose(H);
    const innovationCovariance = matrixMultiply(H, matrixMultiply(P_pred, HT));
    const innovationCovarianceWithNoise = matrixAdd(innovationCovariance, R);

    // Compute the Kalman gain
    const kalmanGain = matrixMultiply(
      P_pred,
      matrixMultiply(HT, inverse(innovationCovarianceWithNoise)),
    );

    return kalmanGain;
  }

  public getState(): {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    ax: number;
    ay: number;
    az: number;
    pitch: number;
    yaw: number;
    pitchRate: number;
    yawRate: number;
  } {
    return {
      x: this.state[0],
      y: this.state[1],
      z: this.state[2],
      vx: this.state[3],
      vy: this.state[4],
      vz: this.state[5],
      ax: this.state[6],
      ay: this.state[7],
      az: this.state[8],
      pitch: this.state[9],
      yaw: this.state[10],
      pitchRate: this.state[11],
      yawRate: this.state[12],
    };
  }
}
