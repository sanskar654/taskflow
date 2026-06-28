import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { taskAPI } from '../utils/api';
import toast from 'react-hot-toast';

// ─── State ────────────────────────────────────────────────────────────────────
const initialState = {
  tasks: [],
  stats: null,
  loading: false,
  statsLoading: false,
  error: null,
  pagination: { total: 0, page: 1, pages: 1, limit: 20 },
  filters: {
    status: '',
    priority: '',
    category: '',
    search: '',
    sort: 'createdAt',
    order: 'desc',
  },
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
function taskReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_STATS_LOADING':
      return { ...state, statsLoading: action.payload };
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, pagination: action.pagination, loading: false, error: null };
    case 'SET_STATS':
      return { ...state, stats: action.payload, statsLoading: false };
    case 'ADD_TASK':
      return { ...state, tasks: [action.payload, ...state.tasks] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((t) => (t._id === action.payload._id ? action.payload : t)),
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter((t) => t._id !== action.payload) };
    case 'DELETE_TASKS':
      return { ...state, tasks: state.tasks.filter((t) => !action.payload.includes(t._id)) };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'RESET_FILTERS':
      return { ...state, filters: initialState.filters };
    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────
const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  const fetchTasks = useCallback(async (extraParams = {}) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const params = { ...state.filters, ...extraParams };
      // Remove empty strings
      Object.keys(params).forEach((k) => { if (params[k] === '') delete params[k]; });
      const res = await taskAPI.getAll(params);
      dispatch({ type: 'SET_TASKS', payload: res.data, pagination: res.pagination });
    } catch (err) {
      dispatch({ type: 'SET_ERROR', payload: err.message });
      toast.error(err.message);
    }
  }, [state.filters]);

  const fetchStats = useCallback(async () => {
    dispatch({ type: 'SET_STATS_LOADING', payload: true });
    try {
      const res = await taskAPI.getStats();
      dispatch({ type: 'SET_STATS', payload: res.data });
    } catch (err) {
      dispatch({ type: 'SET_STATS_LOADING', payload: false });
    }
  }, []);

  const createTask = useCallback(async (data) => {
    const res = await taskAPI.create(data);
    dispatch({ type: 'ADD_TASK', payload: res.data });
    toast.success('Task created!');
    fetchStats();
    return res.data;
  }, [fetchStats]);

  const updateTask = useCallback(async (id, data) => {
    const res = await taskAPI.update(id, data);
    dispatch({ type: 'UPDATE_TASK', payload: res.data });
    toast.success('Task updated!');
    fetchStats();
    return res.data;
  }, [fetchStats]);

  const updateStatus = useCallback(async (id, status) => {
    const res = await taskAPI.updateStatus(id, status);
    dispatch({ type: 'UPDATE_TASK', payload: res.data });
    const labels = { todo: 'Moved to To-Do', 'in-progress': 'Started!', completed: '✓ Completed!' };
    toast.success(labels[status] || 'Status updated');
    fetchStats();
  }, [fetchStats]);

  const deleteTask = useCallback(async (id) => {
    await taskAPI.delete(id);
    dispatch({ type: 'DELETE_TASK', payload: id });
    toast.success('Task deleted');
    fetchStats();
  }, [fetchStats]);

  const bulkDelete = useCallback(async (ids) => {
    await taskAPI.bulkDelete(ids);
    dispatch({ type: 'DELETE_TASKS', payload: ids });
    toast.success(`${ids.length} tasks deleted`);
    fetchStats();
  }, [fetchStats]);

  const setFilters = useCallback((filters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  return (
    <TaskContext.Provider value={{
      ...state,
      fetchTasks,
      fetchStats,
      createTask,
      updateTask,
      updateStatus,
      deleteTask,
      bulkDelete,
      setFilters,
      resetFilters,
    }}>
      {children}
    </TaskContext.Provider>
  );
}

export const useTask = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
};
