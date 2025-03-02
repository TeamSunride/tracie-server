import db from './manager';

/**
 * Adds a datapoint to the database
 * @param latitude The latitude of the datapoint
 * @param longitude The longitude of the datapoint
 * @param altitude The altitude of the datapoint
 * @param fix The fix of the datapoint
 * @param satellitesInView The number of satellites in view of the datapoint
 * @param timestampMilliseconds The timestamp of the datapoint (UNIX time in milliseconds)
 * @param rssi The RSSI of the datapoint
 * @param snr The SNR of the datapoint
 * @param freqErr The frequency error of the datapoint
 * @param radioState The radio state of the datapoint
 */
export function addDatapoint(
  latitude: number,
  longitude: number,
  altitude: number,
  fix: number,
  satellitesInView: number,
  timestampMilliseconds: number,
  rssi: number,
  snr: number,
  freqErr: number,
  radioState: number,
): void {
  const insertQuery = db.prepare(
    `INSERT INTO datapoints (latitude, longitude, altitude, fix, satellitesInView, timestampMilliseconds, rssi, snr, freqErr, radioState) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  );

  const transaction = db.transaction(() => {
    const info = insertQuery.run(
      latitude,
      longitude,
      altitude,
      fix,
      satellitesInView,
      timestampMilliseconds,
      rssi,
      snr,
      freqErr,
      radioState,
    );
    console.info(
      `Inserted ${info.changes} rows with last ID 
         ${info.lastInsertRowid} into datapoints`,
    );
  });

  transaction();
}

/**
 * Fetches the most recent datapoint from the database
 * @returns The most recent datapoint in the database
 */
export function getMostRecentDatapoint(): unknown {
  const query = db.prepare(
    'SELECT * FROM datapoints ORDER BY timestampMilliseconds DESC LIMIT 1',
  );
  return query.get();
}

/**
 * Fetches datapoints from the database
 * @param options The options for the query
 * @param options.maxAge The maximum age of the datapoints to fetch in milliseconds, relative to the current time. e.g. 60 would fetch all datapoints from the last 60 seconds
 * @param options.limit The maximum number of datapoints to fetch
 * @returns The datapoints that match the query
 */
export function getDatapoints({
  maxAge = undefined,
  limit = undefined,
}: {
  maxAge?: number;
  limit?: number;
} = {}): unknown[] {
  if (maxAge === undefined && limit !== undefined) {
    const query = db.prepare(
      `SELECT * FROM datapoints ORDER BY timestampMilliseconds DESC LIMIT ${limit}`,
    );
    return query.all();
  }
  if (maxAge !== undefined && limit === undefined) {
    const query = db.prepare(
      // eslint-disable-next-line no-bitwise
      `SELECT * FROM datapoints WHERE timestampMilliseconds > ${maxAge + Date.now()} ORDER BY timestampMilliseconds DESC`,
    );
    return query.all();
  }
  if (maxAge === undefined && limit === undefined) {
    const query = db.prepare(
      'SELECT * FROM datapoints ORDER BY timestampMilliseconds DESC',
    );
    return query.all();
  }
  if (maxAge !== undefined && limit !== undefined) {
    const query = db.prepare(
      // eslint-disable-next-line no-bitwise
      `SELECT * FROM datapoints WHERE timestampMilliseconds > ${maxAge + Date.now()} ORDER BY timestampMilliseconds DESC LIMIT ${limit}`,
    );
    return query.all();
  }
  throw new Error('Invalid arguments');
}
