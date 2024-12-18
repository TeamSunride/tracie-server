import {
  MemoryRouter as Router,
  Routes,
  Route,
  Outlet,
  Link,
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

  const controls = useAnimation();

  const handleUSBConnection = () => {
    setUsbConnected(!usbConnected);
  };

  const handleFadeToBlack = () => {
    setFadeToBlack(true);
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

  const rocketVariants = {
    idle: {
      y: [0, -100, 0],
      transition: {
        type: 'inertia',
        velocity: 50,
        repeat: Infinity,
        duration: 2,
        repeatType: 'reverse',
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
        repeatType: 'loop',
        ease: 'linear',
      },
    },
  };

  return (
    <div className="flex flex-col">
      <div className='flex'>
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
              // animate={{ width: usbConnected && appConnected ? undefined : 80, height: usbConnected && appConnected ? undefined : 80 }}
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
      <div className='flex'>
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
      {/* <button
        onClick={handleUSBConnection}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        type="button"
      >
        Simulate USB Connection
      </button>
      <button
        onClick={handleAppConnection}
        className="mt-4 p-2 bg-blue-500 text-white rounded"
        type="button"
      >
        Simulate APP Connection
      </button>
      <Link to="connected">
        <button
          className="mt-4 p-2 bg-blue-500 text-white rounded"
          type="button"
        >
          Connected
        </button>
      </Link> */}
      {/* <button
        onClick={handleFadeToBlack}
        className="mt-4 p-2 bg-black text-white rounded"
      >
        Fade to Black
      </button> */}
      {/* <div className="flex justify-center items-center">
        <p>Waiting for USB connection...</p>
      </div>
      <div className="flex justify-center items-center">
        <p>Waiting for APP connection...</p>
      </div> */}
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
