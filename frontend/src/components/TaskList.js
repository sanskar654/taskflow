import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import './TaskList.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function TaskList({ tasks, loading, selected, onSelect, onEdit, onSelectAll, onFocus }) {
  if (loading) {
    return (
      <div className="task-list">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="task-skeleton card" style={{ animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="empty-state"
      >
        <div className="empty-state-icon">📋</div>
        <h3>No tasks here</h3>
        <p>Create your first task to get started, or try adjusting your filters.</p>
      </motion.div>
    );
  }

  const allSelected = tasks.length > 0 && tasks.every((t) => selected.includes(t._id));

  return (
    <div className="task-list-wrap">
      {/* Column header */}
      <div className="list-header">
        <label className="list-select-all">
          <div
            className={`task-checkbox ${allSelected ? 'task-checkbox--checked' : ''}`}
            onClick={() => onSelectAll(tasks.map((t) => t._id), allSelected)}
          >
            {allSelected && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
          <span className="list-header-text">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
        </label>
      </div>

      <motion.div 
        className="task-list"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <AnimatePresence>
          {tasks.map((task) => (
            <motion.div 
              key={task._id} 
              layout
              variants={itemVariants}
              initial="hidden"
              animate="show"
              exit="exit"
              className="task-item"
            >
              <TaskCard
                task={task}
                selected={selected.includes(task._id)}
                onSelect={onSelect}
                onEdit={onEdit}
                onFocus={onFocus}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
