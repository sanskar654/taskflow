import React, { useEffect } from 'react';
import { useTask } from '../context/TaskContext';
import './StatsBar.css';

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className={`stat-card stat-card--${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-value">{value ?? '–'}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function StatsBar() {
  const { stats, statsLoading, fetchStats } = useTask();

  useEffect(() => { fetchStats(); }, [fetchStats]);

  if (statsLoading) {
    return (
      <div className="stats-bar">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="stat-card stat-skeleton" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="stats-bar">
      <StatCard
        label="Total Tasks"
        value={stats.total}
        sub={`${stats.completionRate}% done`}
        color="default"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
          </svg>
        }
      />
      <StatCard
        label="In Progress"
        value={stats.byStatus['in-progress']}
        color="amber"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        }
      />
      <StatCard
        label="Completed"
        value={stats.byStatus.completed}
        sub={`${stats.completedThisWeek} this week`}
        color="green"
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        }
      />
      <StatCard
        label="Overdue"
        value={stats.overdue}
        color={stats.overdue > 0 ? 'red' : 'default'}
        icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        }
      />
    </div>
  );
}
