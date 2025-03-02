import {
  MemoryRouter as Router,
  Routes,
  Route,
  Outlet,
} from 'react-router-dom';
import './App.css';
import { MotionConfig, motion, useAnimation } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import Logo from '../components/Logo/Logo';
import StarryNight from '../components/StarryNight/StarryNight';

function Hello() {
  const [usbConnected, setUsbConnected] = useState(false);
  const [appConnected, setAppConnected] = useState(false);
  const [fadeToBlack, setFadeToBlack] = useState(false);
  const [channel, setChannel] = useState(1);

  const controls = useAnimation();

  const handleUSBConnection = () => {
    setUsbConnected(!usbConnected);
  };

  const handleFadeToBlack = () => {
    setFadeToBlack(true);
  };

  const handleChannelToggle = () => {
    setChannel((prevChannel) => (prevChannel === 1 ? 2 : 1));
  };

  useEffect(() => {
    if (usbConnected && appConnected) {
      controls.stop();
      controls.start('blastOff');
      handleFadeToBlack();
    } else if (!usbConnected && !appConnected) {
      controls.stop();
      controls.start('idle');
    } else if (
      (usbConnected && !appConnected) ||
      (!usbConnected && appConnected)
    ) {
      controls.stop();
      controls.start('shake');
    }
  }, [usbConnected, appConnected, controls]);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    window.electron.onReadRequest((callbackId: string) => {
      // used to detect when the app is connected
      setAppConnected(true);
      console.log('Read request received from main process, app connected');
      // we don't actually respond to the read request, the main process does
      // but for future reference, this is how you would respond
      // window.electron.invokeBleReadRequestCallback(callbackId, 'Hello from renderer');
    });

    window.electron.onSerialPortConnected(() => {
      console.log('Serial port connected');
      setUsbConnected(true);
    });

    window.electron.onSerialPortDisconnected(() => {
      console.log('Serial port disconnected');
      setUsbConnected(false);
    });
  }, []);

  useEffect(() => {
    window.electron.setGroundstationChannel(channel);
  }, [channel]);

  const rocketVariants = {
    idle: {
      y: [0, -100, 0],
      transition: {
        type: 'inertia',
        velocity: 50,
        repeat: Infinity,
        duration: 2,
        repeatType: 'reverse' as const,
      },
    },
    blastOff: {
      y: -1000,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 100,
      },
    },
    shake: {
      x: [0, -10, 10, -10, 10, -10, 10, 0],
      transition: {
        duration: 0.5,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'linear',
      },
    },
  };

  return (
    <div className="flex flex-col">
      <div className="flex">
        <motion.div
          className="flex justify-center items-center min-h-96 w-full mt-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeToBlack ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          <MotionConfig
            transition={{
              type: 'spring',
              damping: 20,
              stiffness: 100,
            }}
          >
            <motion.div
              className="rounded-full bg-black p-4 h-80 w-80 flex justify-center items-center"
              whileHover={{ scale: 0.9, backgroundPosition: '100% 50%' }}
              style={{
                background:
                  'linear-gradient(45deg, #ff6b6b, #f06595, #cc5de8, #845ef7, #5c7cfa, #339af0, #22b8cf, #20c997, #51cf66, #94d82d, #fcc419, #ff922b)',
                backgroundSize: '300% 300%',
                transition: 'background-position 0.5s ease',
              }}
            >
              <motion.div
                className="text-9xl flex justify-center items-center"
                variants={rocketVariants}
                animate={controls}
                initial="idle"
              >
                🚀
              </motion.div>
            </motion.div>
          </MotionConfig>
        </motion.div>
      </div>
      <div className="flex">
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeToBlack ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-center items-center">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: usbConnected ? 1 : 0,
                y: usbConnected ? 0 : -20,
              }}
              transition={{ duration: 0.5 }}
              className="text-green-500"
            >
              USB Connected!
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeToBlack ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-center items-center">
            <motion.p
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: usbConnected ? 0 : 1,
                y: usbConnected ? 20 : 0,
              }}
              transition={{ duration: 0.5 }}
              className="text-red-500"
            >
              Waiting for USB connection...
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeToBlack ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-center items-center">
            <motion.p
              initial={{ opacity: 0, y: -20 }}
              animate={{
                opacity: appConnected ? 1 : 0,
                y: appConnected ? 0 : -20,
              }}
              transition={{ duration: 0.5 }}
              className="text-green-500"
            >
              APP Connected!
            </motion.p>
          </div>
        </motion.div>
        <motion.div
          className="flex justify-center items-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: fadeToBlack ? 0 : 1 }}
          transition={{ duration: 1 }}
        >
          <div className="flex justify-center items-center">
            <motion.p
              initial={{ opacity: 1, y: 0 }}
              animate={{
                opacity: appConnected ? 0 : 1,
                y: appConnected ? 20 : 0,
              }}
              transition={{ duration: 0.5 }}
              className="text-red-500"
            >
              Waiting for APP connection...
            </motion.p>
          </div>
        </motion.div>
      </div>
      <div className="flex justify-center items-center mt-4">
        <label className="flex items-center cursor-pointer">
          <div className={`mr-3 font-medium ${channel === 1 ? 'text-white' : 'text-gray-400'}`}>Channel 1</div>
          <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={channel === 2}
          onChange={handleChannelToggle}
        />
        <div className="block bg-gray-600 w-14 h-8 rounded-full"></div>
        <div
          className={`dot absolute left-1 top-1 bg-gray-300 w-6 h-6 rounded-full transition ${
        channel === 2 ? 'transform translate-x-full bg-blue-500' : ''
          }`}
        ></div>
          </div>
          <div className={`ml-3 font-medium ${channel === 2 ? 'text-white' : 'text-gray-400'}`}>Channel 2</div>
        </label>
      </div>
    </div>
  );
}

function Layout() {
  const starryBackground = useMemo(() => <StarryNight />, []);

  return (
    <>
      <Logo />
      <div className="flex justify-center items-center min-h-96 w-full mt-4">
        <Outlet />
      </div>
      {starryBackground}
    </>
  );
}

function Connected() {
  return <p className="text-3xl">Connected!</p>;
}

function NoPage() {
  return (
    <>
      <p className="text-3xl">404 Not Found</p>
      <p className="text-3xl">¯\_(ツ)_/¯</p>
      <p className="text-3xl">How did you even get here</p>
      <p className="text-3xl">get out</p>
    </>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Hello />} />
          <Route path="connected" element={<Connected />} />
          <Route path="*" element={<NoPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
