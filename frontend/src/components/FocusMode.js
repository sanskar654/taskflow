import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './FocusMode.css';

export default function FocusMode({ task, onClose }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play a sound or show notification here in a real app
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate percentage for SVG circle
  const percentage = (timeLeft / (25 * 60)) * 100;
  const strokeDashoffset = 1000 - (1000 * percentage) / 100;

  return (
    <motion.div 
      className="focus-overlay"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.3 }}
    >
      <button className="focus-close" onClick={onClose}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
      </button>

      <div className="focus-content">
        <motion.div 
          className="focus-task-info"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <span className="focus-label">Currently Focusing On</span>
          <h2 className="focus-task-title">{task.title}</h2>
        </motion.div>

        <div className="focus-timer-container">
          <svg className="focus-timer-svg" viewBox="0 0 340 340">
            <circle cx="170" cy="170" r="160" className="focus-timer-track" />
            <motion.circle 
              cx="170" cy="170" r="160" 
              className="focus-timer-progress" 
              style={{ strokeDashoffset, strokeDasharray: 1000 }}
              animate={isActive ? { filter: ['drop-shadow(0 0 10px var(--accent))', 'drop-shadow(0 0 30px var(--accent))', 'drop-shadow(0 0 10px var(--accent))'] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </svg>
          <div className="focus-time-display">
            {formatTime(timeLeft)}
          </div>
        </div>

        <motion.div 
          className="focus-controls"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <button className={`btn btn-lg ${isActive ? 'btn-secondary' : 'btn-primary'}`} onClick={toggleTimer}>
            {isActive ? 'PAUSE' : 'START FOCUS'}
          </button>
          <button className="btn btn-lg btn-ghost" onClick={resetTimer}>
            RESET
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
