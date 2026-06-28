import React, { useState } from 'react';
import { format, isPast, isToday, isTomorrow } from 'date-fns';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useTask } from '../context/TaskContext';
import './TaskCard.css';

const STATUS_CYCLE = { todo: 'in-progress', 'in-progress': 'completed', completed: 'todo' };
const STATUS_LABELS = { todo: 'To Do', 'in-progress': 'In Progress', completed: 'Completed' };
const PRIORITY_DOTS = { low: '●', medium: '●', high: '●' };

function DueLabel({ date }) {
  if (!date) return null;
  const d = new Date(date);
  if (isToday(d)) return <span className="due-label due-today">Due today</span>;
  if (isTomorrow(d)) return <span className="due-label due-soon">Due tomorrow</span>;
  if (isPast(d)) return <span className="due-label due-overdue">Overdue · {format(d, 'MMM d')}</span>;
  return <span className="due-label">{format(d, 'MMM d, yyyy')}</span>;
}

export default function TaskCard({ task, selected, onSelect, onEdit, onFocus }) {
  const { updateStatus, deleteTask } = useTask();
  const [deleting, setDeleting] = useState(false);
  const [cycling, setCycling] = useState(false);

  // 3D Tilt Effect State
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring physics for the tilt
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const smoothX = useSpring(x, springConfig);
  const smoothY = useSpring(y, springConfig);
  
  // Map mouse position to rotation (-15 to 15 degrees)
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [15, -15]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-15, 15]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPos = (e.clientX - rect.left) / rect.width - 0.5;
    const yPos = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(xPos);
    y.set(yPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const handleCycleStatus = async (e) => {
    e.stopPropagation();
    if (cycling) return;
    setCycling(true);
    await updateStatus(task._id, STATUS_CYCLE[task.status]);
    setCycling(false);
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setDeleting(true);
    await deleteTask(task._id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleSelect = (e) => {
    e.stopPropagation();
    onSelect(task._id);
  };

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed';

  return (
    <div style={{ perspective: 1200 }}>
      <motion.div
        className={`task-card card ${selected ? 'task-card--selected' : ''} ${deleting ? 'task-card--deleting' : ''} ${isOverdue ? 'task-card--overdue' : ''}`}
        onClick={handleEdit}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={{ scale: 1.02, y: -4 }}
      >
        {/* Select checkbox */}
        <div className="task-select" onClick={handleSelect} style={{ transform: "translateZ(30px)" }}>
          <div className={`task-checkbox ${selected ? 'task-checkbox--checked' : ''}`}>
            {selected && (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </div>
        </div>

        <div className="task-main" style={{ transform: "translateZ(40px)" }}>
          {/* Top row */}
          <div className="task-top">
            <button
              className={`status-pill status-pill--${task.status}`}
              onClick={handleCycleStatus}
              disabled={cycling}
              title="Click to advance status"
            >
              <span className={`glow-dot ${task.status}`} />
              {STATUS_LABELS[task.status]}
            </button>

            <div className="task-actions">
              <button className="btn btn-ghost btn-icon task-btn" onClick={(e) => { e.stopPropagation(); if(onFocus) onFocus(task); }} title="Focus Mode">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </button>
              <button className="btn btn-ghost btn-icon task-btn" onClick={handleEdit} title="Edit task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button className="btn btn-ghost btn-icon task-btn task-btn--danger" onClick={handleDelete} title="Delete task">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Title */}
          <h3 className={`task-title ${task.status === 'completed' ? 'task-title--done' : ''}`}>
            {task.title}
          </h3>

          {/* Description */}
          {task.description && (
            <p className="task-desc">{task.description}</p>
          )}

          {/* Tags */}
          {task.tags?.length > 0 && (
            <div className="task-tags">
              {task.tags.map((tag) => (
                <span key={tag} className="tag"># {tag}</span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="task-footer">
            <div className="task-meta">
              <span className={`priority-dot priority-dot--${task.priority}`}>
                {PRIORITY_DOTS[task.priority]} {task.priority}
              </span>
              {task.category && task.category !== 'General' && (
                <span className="task-category">{task.category}</span>
              )}
            </div>
            <div className="task-dates">
              <DueLabel date={task.dueDate} />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
