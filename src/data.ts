// parser from original tracie desktop app

// def readSerial(self):
//     if self.ser is not None and self.ser.isOpen():
//         try:
//             line = self.ser.readline().decode("utf-8").strip()
//             if line == "":
//                 return
//             # print(line)
//             if line.startswith("[DATA]:"):
//                 line = line.split(":")[1] # Remove the [DATA]: part
//                 data = line.split(",")
//                 print(line)
//                 latitude, longitude, altitude, fix, siv, max_altitude_m, rssi, snr, freqerr, radio_state = data
//                 self.raw_data = data
//                 self.logData()
//                 if int(radio_state) == 0: # Only uncorrupted packets get displayed on the GUI
//                     if fix != "0":
//                         self.time_circular_buffer.append(time.time() - self.altitudeGraphTime)
//                         self.altitude_circular_buffer.append(float(altitude))
//                     self.good_packet_count += 1
//                     self.updateFlightPage()
//                     if (self.good_packet_count % 30 == 0) or (time.time() - self.last_packet_rec_time > 10):
//                         self.update_map()
//                 else:
//                     self.last_packet_rec_time = time.time() # We still want to know that we recieved _something_, so update the packet age.
//                     self.continuous_update()
//         except Exception as e:
//             print(e)

export function parseRawData(rawData: string) {
  if (rawData.startsWith('[DATA]:')) {
    const splitData = rawData.split(':').pop().split(',');
    // latitude, longitude, altitude, fix, siv, max_altitude_m, rssi, snr, freqerr, radio_state
    const data = {
      latitude: parseFloat(splitData[0]),
      longitude: parseFloat(splitData[1]),
      altitude: parseFloat(splitData[2]),
      fix: parseInt(splitData[3], 10),
      siv: parseInt(splitData[4], 10),
      maxAltitude: parseFloat(splitData[5]),
      rssi: parseFloat(splitData[6]),
      snr: parseFloat(splitData[7]),
      freqError: parseFloat(splitData[8]),
      radioState: parseInt(splitData[9], 10), // 0 for uncorrupted packets
    };
    return data;
  }
  throw new Error('Invalid data format');
}
