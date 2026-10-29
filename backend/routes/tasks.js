const express = require('express');
const { protect } = require('../middleware/auth');
const { Task, Project } = require('../models');

const router = express.Router();

const formatTask = (t) => ({
  id: t._id,
  _id: t._id,
  title: t.title,
  project: t.project,
  project_code: t.project?.code || `PRJ-${String(t.project).slice(-4)}`,
  status: t.status || 'todo',
  priority: t.priority || 'medium',
  due_date: t.due_date,
  assigned_to: t.assigned_to || '',
  progress_percentage: t.progress_percentage || 0,
  comments: t.comments || [],
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

// GET /api/tasks/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const { search, status, project_id } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (project_id) {
      query.project = project_id;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const tasks = await Task.find(query).populate('project').sort({ createdAt: -1 });
    res.json(tasks.map(formatTask));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
});

// GET /api/tasks/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch task' });
  }
});

// POST /api/tasks/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      project: req.body.project || null,
      status: req.body.status || 'todo',
      priority: req.body.priority || 'medium',
      due_date: req.body.due_date || null,
      assigned_to: req.body.assigned_to || '',
      business: req.user?.business || null,
    });
    res.status(201).json(formatTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete task' });
  }
});

// POST /api/tasks/:id/comments/
router.post(['/:id/comments', '/:id/comments/'], protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.comments.push({
      text: req.body.text || req.body.comment || '',
      author: req.user?.name || 'User',
      created_at: new Date(),
    });
    await task.save();
    res.json(formatTask(task));
  } catch (err) {
    res.status(500).json({ message: 'Failed to add comment' });
  }
});

module.exports = router;
