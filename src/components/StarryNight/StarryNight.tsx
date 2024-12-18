import { motion } from 'motion/react';
import React from 'react';

export default function StarryNight() {
  const particleVariants = (
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    delay: number,
  ) => ({
    initial: {
      opacity: 0,
      x: startX,
      y: startY,
    },
    animate: {
      opacity: [0, 0.8, 0],
      x: [startX, endX],
      y: [startY, endY],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatDelay: 5,
        delay,
      },
    },
  });

  const cometVariants = {
    initial: {
      opacity: 0,
      x: 0,
      y: 0,
    },
    animate: {
      opacity: [0, 1, 0],
      x: [0, 200, 400],
      y: [0, -200, -400],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatDelay: 10,
        delay: Math.random() * 10,
      },
    },
  };

  const generateRandomPosition = () => ({
    startX: Math.random() * window.innerWidth,
    startY: Math.random() * window.innerHeight,
    endX: Math.random() * 100 - 75,
    endY: Math.random() * 100 - 75,
  });

  const generateRandomDelay = () => Math.random() * 10;

  return (
    <div className="starry-night">
      <div className="milky-way" />
      {[...Array(300)].map(() => {
        const delay = Math.random() * 2; // Random delay between 0 and 2 seconds
        return (
          <div
            key={Math.random().toString(36).slice(2, 9)}
            className="star"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}
      {[...Array(5)].map(() => {
        const { startX, startY, endX, endY } = generateRandomPosition();
        const delay = generateRandomDelay();
        return (
          <motion.div
            key={Math.random().toString(36).slice(2, 9)}
            className="particles"
            initial="initial"
            animate="animate"
            variants={{
              animate: {
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
            style={{
              position: 'absolute',
              top: startY,
              left: startX,
            }}
          >
            {[...Array(10)].map((_, j) => (
              <motion.div
                key={Math.random().toString(36).slice(2, 9)}
                className="particle"
                variants={particleVariants(
                  0,
                  0,
                  endX,
                  endY,
                  delay + j * 0.1,
                )}
                initial="initial"
                animate="animate"
              />
            ))}
          </motion.div>
        );
      })}
      {[...Array(3)].map(() => (
        <motion.div
          key={Math.random().toString(36).slice(2, 9)}
          className="comet"
          variants={cometVariants}
          initial="initial"
          animate="animate"
          style={{
            top: `${Math.random() * window.innerHeight}px`,
            left: `${Math.random() * window.innerWidth}px`,
          }}
        />
      ))}
    </div>
  );
}
