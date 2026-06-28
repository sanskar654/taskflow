import React from 'react';
import { motion } from 'framer-motion';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import { useTask } from '../context/TaskContext';
import './AnalyticsModal.css';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement, Title
);

export default function AnalyticsModal({ onClose }) {
  const { tasks } = useTask();

  // Status Data
  const todo = tasks.filter(t => t.status === 'todo').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  const statusData = {
    labels: ['To Do', 'In Progress', 'Completed'],
    datasets: [
      {
        data: [todo, inProgress, completed],
        backgroundColor: [
          'rgba(148, 163, 184, 0.8)',
          'rgba(251, 191, 36, 0.8)',
          'rgba(52, 211, 153, 0.8)',
        ],
        borderColor: [
          'rgba(148, 163, 184, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(52, 211, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Priority Data
  const low = tasks.filter(t => t.priority === 'low').length;
  const medium = tasks.filter(t => t.priority === 'medium').length;
  const high = tasks.filter(t => t.priority === 'high').length;

  const priorityData = {
    labels: ['Low', 'Medium', 'High'],
    datasets: [
      {
        label: 'Tasks by Priority',
        data: [low, medium, high],
        backgroundColor: [
          'rgba(52, 211, 153, 0.6)',
          'rgba(251, 191, 36, 0.6)',
          'rgba(244, 63, 94, 0.6)',
        ],
        borderColor: [
          'rgba(52, 211, 153, 1)',
          'rgba(251, 191, 36, 1)',
          'rgba(244, 63, 94, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { ticks: { color: '#94A3B8', stepSize: 1 } },
      x: { ticks: { color: '#94A3B8' } }
    }
  };

  const doughnutOptions = {
    plugins: {
      legend: { labels: { color: '#F8FAFC' } }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div 
        className="modal analytics-modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
      >
        <div className="modal-header">
          <h2>Productivity Insights</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div className="modal-body analytics-body">
          <div className="analytics-card">
            <h3>Task Status Overview</h3>
            <div className="chart-container doughnut-container">
              <Doughnut data={statusData} options={doughnutOptions} />
            </div>
          </div>
          
          <div className="analytics-card">
            <h3>Tasks by Priority</h3>
            <div className="chart-container bar-container">
              <Bar data={priorityData} options={barOptions} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
