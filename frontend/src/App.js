import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import { TaskProvider, useTask } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginSignup from './components/LoginSignup';
import Header from './components/Header';
import StatsBar from './components/StatsBar';
import FilterBar from './components/FilterBar';
import TaskList from './components/TaskList';
import KanbanBoard from './components/KanbanBoard';
import TaskForm from './components/TaskForm';
import FocusMode from './components/FocusMode';
import AnalyticsModal from './components/AnalyticsModal';
import { AnimatePresence } from 'framer-motion';
import './styles/global.css';
import './App.css';

function TaskApp() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { tasks, loading, pagination, fetchTasks, bulkDelete, filters } = useTask();
  const [selected, setSelected] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [focusTask, setFocusTask] = useState(null);
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'board'

  // Fetch tasks only when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [fetchTasks, isAuthenticated]);

  // Re-clear selections when filters change
  useEffect(() => {
    setSelected([]);
  }, [filters]);

  const handleSelect = useCallback((id) => {
    setSelected((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  }, []);

  const handleSelectAll = useCallback((ids, allSelected) => {
    setSelected(allSelected ? [] : ids);
  }, []);

  const handleNewTask = () => { setEditTask(null); setFormOpen(true); };
  const handleEdit = (task) => { setEditTask(task); setFormOpen(true); };
  const handleFocus = (task) => { setFocusTask(task); };
  const handleClose = () => { setFormOpen(false); setEditTask(null); };
  const handleFocusClose = () => { setFocusTask(null); };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selected.length} tasks?`)) return;
    await bulkDelete(selected);
    setSelected([]);
  };

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0c10' }}>
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginSignup />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#22263A',
              color: '#F1F5F9',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              fontSize: '13px',
            },
            success: { iconTheme: { primary: '#10B981', secondary: '#22263A' } },
            error: { iconTheme: { primary: '#EF4444', secondary: '#22263A' } },
          }}
        />
      </>
    );
  }

  return (
    <div className="app-wrapper">
      <Header onNewTask={handleNewTask} onOpenAnalytics={() => setAnalyticsOpen(true)} />

      <main className="app-main">
        <div className="app-container">
          {/* Hero */}
          <motion.div 
            className="hero"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.25, 0.8, 0.25, 1] }}
          >
            <h1 className="hero-title">
              Your tasks,<br />
              <span className="hero-accent">organized.</span>
            </h1>
            <p className="hero-sub">
              A full-stack MERN task manager with real-time updates, rich filtering, and a clean workflow.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <StatsBar />
          </motion.div>

          {/* Filters */}
          <FilterBar
            selected={selected}
            onSelectChange={setSelected}
            onBulkDelete={handleBulkDelete}
          />

          {/* View Toggle */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
            <div style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: '4px', border: '1px solid var(--border)' }}>
              <button 
                onClick={() => setViewMode('list')}
                className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                List
              </button>
              <button 
                onClick={() => setViewMode('board')}
                className={`btn btn-sm ${viewMode === 'board' ? 'btn-primary' : 'btn-ghost'}`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                Board
              </button>
            </div>
          </div>

          {/* Task View (List or Board) */}
          {viewMode === 'list' ? (
            <TaskList
              tasks={tasks}
              loading={loading}
              selected={selected}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onSelectAll={handleSelectAll}
              onFocus={handleFocus}
            />
          ) : (
            <KanbanBoard
              tasks={tasks}
              selected={selected}
              onSelect={handleSelect}
              onEdit={handleEdit}
              onFocus={handleFocus}
            />
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="pagination">
              <span className="pagination-info">
                Showing {tasks.length} of {pagination.total}
              </span>
              <div className="pagination-btns">
                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => fetchTasks({ page: p })}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <footer className="app-footer">
            <div className="footer-stack">
              <span className="stack-pill">React</span>
              <span className="stack-sep">+</span>
              <span className="stack-pill">Node.js</span>
              <span className="stack-sep">+</span>
              <span className="stack-pill">Express</span>
              <span className="stack-sep">+</span>
              <span className="stack-pill">MongoDB</span>
            </div>
            <span className="footer-credit">MERN Stack · Built for internship project</span>
          </footer>
        </div>
      </main>

      {/* Floating action button (mobile) */}
      <button className="fab" onClick={handleNewTask} aria-label="New task">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
        </svg>
      </button>

      {/* Task form modal */}
      {formOpen && <TaskForm task={editTask} onClose={handleClose} />}

      {/* Focus Mode Overlay */}
      <AnimatePresence>
        {focusTask && <FocusMode task={focusTask} onClose={handleFocusClose} />}
      </AnimatePresence>

      {/* Analytics Modal */}
      <AnimatePresence>
        {analyticsOpen && <AnalyticsModal onClose={() => setAnalyticsOpen(false)} />}
      </AnimatePresence>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#22263A',
            color: '#F1F5F9',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            fontSize: '13px',
          },
          success: { iconTheme: { primary: '#10B981', secondary: '#22263A' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#22263A' } },
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <TaskApp />
      </TaskProvider>
    </AuthProvider>
  );
}
