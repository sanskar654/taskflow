import React, { useState, useEffect, useRef } from 'react';
import { useTask } from '../context/TaskContext';
import './TaskForm.css';

const defaultForm = {
  title: '', description: '', status: 'todo', priority: 'medium',
  category: '', dueDate: '', tags: '',
};

function validate(form) {
  const errors = {};
  if (!form.title.trim()) errors.title = 'Title is required';
  else if (form.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  else if (form.title.trim().length > 100) errors.title = 'Title cannot exceed 100 characters';
  if (form.description.length > 500) errors.description = 'Description cannot exceed 500 characters';
  if (form.category.length > 50) errors.category = 'Category cannot exceed 50 characters';
  if (form.tags) {
    const tagList = form.tags.split(',').map((t) => t.trim()).filter(Boolean);
    if (tagList.length > 5) errors.tags = 'Maximum 5 tags allowed';
    if (tagList.some((t) => t.length > 30)) errors.tags = 'Each tag must be under 30 characters';
  }
  return errors;
}

export default function TaskForm({ task, onClose }) {
  const { createTask, updateTask } = useTask();
  const isEdit = !!task;

  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        category: task.category || '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
        tags: task.tags?.join(', ') || '',
      });
    }
    titleRef.current?.focus();
  }, [task]);

  const set = (key, val) => {
    setForm((f) => ({ ...f, [key]: val }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleSubmit = async () => {
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        priority: form.priority,
        category: form.category.trim() || 'General',
        dueDate: form.dueDate || null,
        tags: form.tags
          ? form.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };

      if (isEdit) {
        await updateTask(task._id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      // toast already shown in context
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
  };

  const charCount = form.title.length;

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" onKeyDown={handleKeyDown} role="dialog" aria-modal="true">

        <div className="modal-header">
          <div className="modal-title-row">
            <div className="modal-icon">
              {isEdit ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              )}
            </div>
            <h2>{isEdit ? 'Edit Task' : 'New Task'}</h2>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-grid">

            {/* Title */}
            <div className="form-group form-full">
              <label className="form-label required">Title</label>
              <div className="input-count-wrap">
                <input
                  ref={titleRef}
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  maxLength={100}
                />
                <span className={`char-count ${charCount > 80 ? 'char-count--warn' : ''}`}>
                  {charCount}/100
                </span>
              </div>
              {errors.title && <span className="form-error">⚠ {errors.title}</span>}
            </div>

            {/* Description */}
            <div className="form-group form-full">
              <label className="form-label">Description</label>
              <textarea
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="Add more detail… (optional)"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                maxLength={500}
                rows={3}
              />
              {errors.description && <span className="form-error">⚠ {errors.description}</span>}
            </div>

            {/* Status */}
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={(e) => set('status', e.target.value)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="form-group">
              <label className="form-label">Priority</label>
              <div className="priority-pills">
                {['low', 'medium', 'high'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`priority-pill priority-pill--${p} ${form.priority === p ? 'active' : ''}`}
                    onClick={() => set('priority', p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <input
                className={`form-input ${errors.category ? 'error' : ''}`}
                placeholder="e.g. Work, Personal"
                value={form.category}
                onChange={(e) => set('category', e.target.value)}
                maxLength={50}
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Work" /><option value="Personal" /><option value="Study" />
                <option value="Health" /><option value="Finance" /><option value="Project" />
              </datalist>
              {errors.category && <span className="form-error">⚠ {errors.category}</span>}
            </div>

            {/* Due Date */}
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                min={new Date().toISOString().slice(0, 10)}
              />
            </div>

            {/* Tags */}
            <div className="form-group form-full">
              <label className="form-label">Tags <span className="form-hint">(comma-separated, max 5)</span></label>
              <input
                className={`form-input ${errors.tags ? 'error' : ''}`}
                placeholder="design, frontend, urgent"
                value={form.tags}
                onChange={(e) => set('tags', e.target.value)}
              />
              {errors.tags && <span className="form-error">⚠ {errors.tags}</span>}
              {/* Tag preview */}
              {form.tags && (
                <div className="tag-preview">
                  {form.tags.split(',').filter((t) => t.trim()).slice(0, 5).map((t, i) => (
                    <span key={i} className="tag"># {t.trim()}</span>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <><div className="spinner" style={{width:14,height:14}} /> Saving…</>
            ) : (
              isEdit ? 'Save Changes' : 'Create Task'
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
