import React, { useState } from 'react';
import { useTask } from '../context/TaskContext';
import './FilterBar.css';

export default function FilterBar({ selected, onSelectChange, onBulkDelete }) {
  const { filters, setFilters, resetFilters, fetchTasks } = useTask();
  const [localSearch, setLocalSearch] = useState(filters.search);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setFilters({ search: localSearch });
      fetchTasks({ search: localSearch });
    }
  };

  const handleSearchClear = () => {
    setLocalSearch('');
    setFilters({ search: '' });
    fetchTasks({ search: '' });
  };

  const handleFilter = (key, value) => {
    setFilters({ [key]: value });
    fetchTasks({ [key]: value });
  };

  const handleReset = () => {
    setLocalSearch('');
    resetFilters();
    fetchTasks({
      status: '', priority: '', category: '',
      search: '', sort: 'createdAt', order: 'desc',
    });
  };

  const hasActiveFilters = filters.status || filters.priority || filters.search || filters.category;

  return (
    <div className="filter-bar">
      <div className="filter-row">
        {/* Search */}
        <div className="search-wrap">
          <svg className="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="form-input search-input"
            placeholder="Search tasks… (Enter to search)"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          {localSearch && (
            <button className="search-clear" onClick={handleSearchClear} aria-label="Clear search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>

        {/* Status filter */}
        <select
          className="form-select filter-select"
          value={filters.status}
          onChange={(e) => handleFilter('status', e.target.value)}
        >
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        {/* Priority filter */}
        <select
          className="form-select filter-select"
          value={filters.priority}
          onChange={(e) => handleFilter('priority', e.target.value)}
        >
          <option value="">All Priority</option>
          <option value="high">🔴 High</option>
          <option value="medium">🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>

        {/* Sort */}
        <select
          className="form-select filter-select"
          value={`${filters.sort}:${filters.order}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(':');
            setFilters({ sort, order });
            fetchTasks({ sort, order });
          }}
        >
          <option value="createdAt:desc">Newest first</option>
          <option value="createdAt:asc">Oldest first</option>
          <option value="dueDate:asc">Due date ↑</option>
          <option value="priority:desc">Priority ↓</option>
          <option value="title:asc">Title A–Z</option>
        </select>

        {/* Reset */}
        {hasActiveFilters && (
          <button className="btn btn-ghost btn-sm filter-reset" onClick={handleReset}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
            </svg>
            Reset
          </button>
        )}
      </div>

      {/* Bulk actions */}
      {selected.length > 0 && (
        <div className="bulk-bar animate-in">
          <span className="bulk-count">{selected.length} selected</span>
          <button className="btn btn-danger btn-sm" onClick={onBulkDelete}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/>
            </svg>
            Delete {selected.length}
          </button>
        </div>
      )}
    </div>
  );
}
