const express = require('express');
const router = express.Router();
const Task = require('../models/Task');
const { validateCreateTask, validateUpdateTask, validateMongoId } = require('../middleware/validate');
const { protect } = require('../middleware/auth');

// ─── Helper ────────────────────────────────────────────────────────────────────
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

// Protect all task routes
router.use(protect);

// ─── GET /api/tasks ─────────────────────────────────────────────────────────────
// Supports: ?status=&priority=&category=&search=&sort=&order=&page=&limit=&tags=
router.get('/', asyncHandler(async (req, res) => {
  const {
    status, priority, category, search,
    sort = 'createdAt', order = 'desc',
    page = 1, limit = 20, tags,
  } = req.query;

  const filter = { user: req.user.id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = { $regex: category, $options: 'i' };
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }
  if (tags) {
    const tagList = tags.split(',').map((t) => t.trim());
    filter.tags = { $in: tagList };
  }

  const sortOrder = order === 'asc' ? 1 : -1;
  const allowedSorts = ['createdAt', 'updatedAt', 'dueDate', 'priority', 'title'];
  const sortField = allowedSorts.includes(sort) ? sort : 'createdAt';

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const total = await Task.countDocuments(filter);

  const tasks = await Task.find(filter)
    .sort({ [sortField]: sortOrder })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
}));

// ─── GET /api/tasks/stats ────────────────────────────────────────────────────────
router.get('/stats', asyncHandler(async (req, res) => {
  const userIdMatch = { $match: { user: req.user._id } };
  
  const [statusCounts, priorityCounts, overdueTasks, completedThisWeek] = await Promise.all([
    Task.aggregate([userIdMatch, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.aggregate([userIdMatch, { $group: { _id: '$priority', count: { $sum: 1 } } }]),
    Task.countDocuments({
      user: req.user.id,
      dueDate: { $lt: new Date() },
      status: { $ne: 'completed' },
    }),
    Task.countDocuments({
      user: req.user.id,
      status: 'completed',
      completedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  const statusMap = { todo: 0, 'in-progress': 0, completed: 0 };
  statusCounts.forEach(({ _id, count }) => { statusMap[_id] = count; });

  const priorityMap = { low: 0, medium: 0, high: 0 };
  priorityCounts.forEach(({ _id, count }) => { priorityMap[_id] = count; });

  const total = Object.values(statusMap).reduce((a, b) => a + b, 0);
  const completionRate = total > 0 ? Math.round((statusMap.completed / total) * 100) : 0;

  res.json({
    success: true,
    data: {
      total,
      byStatus: statusMap,
      byPriority: priorityMap,
      overdue: overdueTasks,
      completedThisWeek,
      completionRate,
    },
  });
}));

// ─── GET /api/tasks/:id ──────────────────────────────────────────────────────────
router.get('/:id', validateMongoId, asyncHandler(async (req, res) => {
  const task = await Task.findOne({ _id: req.params.id, user: req.user.id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.json({ success: true, data: task });
}));

// ─── POST /api/tasks ─────────────────────────────────────────────────────────────
router.post('/', validateCreateTask, asyncHandler(async (req, res) => {
  const { title, description, status, priority, category, dueDate, tags } = req.body;

  const task = await Task.create({
    user: req.user.id,
    title,
    description,
    status,
    priority,
    category,
    dueDate,
    tags,
  });

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task,
  });
}));

// ─── PUT /api/tasks/:id ──────────────────────────────────────────────────────────
router.put('/:id', validateUpdateTask, asyncHandler(async (req, res) => {
  const { title, description, status, priority, category, dueDate, tags } = req.body;

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { title, description, status, priority, category, dueDate, tags },
    { new: true, runValidators: true }
  );

  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task,
  });
}));

// ─── PATCH /api/tasks/:id/status ────────────────────────────────────────────────
router.patch('/:id/status', validateMongoId, asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['todo', 'in-progress', 'completed'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status value' });
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { status },
    { new: true, runValidators: true }
  );

  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.json({ success: true, message: 'Status updated', data: task });
}));

// ─── DELETE /api/tasks/:id ───────────────────────────────────────────────────────
router.delete('/:id', validateMongoId, asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  res.json({ success: true, message: 'Task deleted successfully', data: { id: req.params.id } });
}));

// ─── DELETE /api/tasks/bulk/delete ──────────────────────────────────────────────
router.delete('/bulk/delete', asyncHandler(async (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ success: false, message: 'Provide an array of task IDs' });
  }

  const result = await Task.deleteMany({ _id: { $in: ids }, user: req.user.id });

  res.json({
    success: true,
    message: `${result.deletedCount} task(s) deleted`,
    data: { deleted: result.deletedCount },
  });
}));

// ─── Global error handler ────────────────────────────────────────────────────────
router.use((err, req, res, next) => {
  console.error('Route error:', err);
  res.status(500).json({ success: false, message: err.message || 'Internal server error' });
});

module.exports = router;
