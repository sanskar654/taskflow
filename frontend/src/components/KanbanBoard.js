import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import TaskCard from './TaskCard';
import './KanbanBoard.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const columnVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 24 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

export default function KanbanBoard({ tasks, selected, onSelect, onEdit, onFocus }) {
  const columns = [
    { id: 'todo', title: 'To Do', color: 'var(--status-todo)' },
    { id: 'in-progress', title: 'In Progress', color: 'var(--status-progress)' },
    { id: 'completed', title: 'Completed', color: 'var(--status-done)' }
  ];

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

  return (
    <motion.div 
      className="kanban-board"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {columns.map(col => {
        const columnTasks = tasks.filter(t => t.status === col.id);
        
        return (
          <motion.div key={col.id} className="kanban-column" variants={columnVariants}>
            <div className="kanban-column-header">
              <div className="kanban-column-title" style={{ color: col.color }}>
                <span className="glow-dot" style={{ background: col.color, boxShadow: `0 0 10px ${col.color}` }} />
                {col.title}
              </div>
              <div className="kanban-column-count">{columnTasks.length}</div>
            </div>
            
            <div className="kanban-column-body">
              <AnimatePresence>
                {columnTasks.map(task => (
                  <motion.div 
                    key={task._id} 
                    layout
                    variants={itemVariants}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    className="kanban-item"
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
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
