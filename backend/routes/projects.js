const express = require('express');
const { protect } = require('../middleware/auth');
const { Project } = require('../models');

const router = express.Router();

const formatProject = (p) => ({
  id: p._id,
  _id: p._id,
  title: p.title,
  code: p.code || `PRJ-${String(p._id).slice(-4).toUpperCase()}`,
  client: p.client,
  status: p.status || 'active',
  priority: p.priority || 'medium',
  budget: p.budget || 0,
  start_date: p.start_date,
  end_date: p.end_date,
  description: p.description || '',
  members: p.members || [],
  vendor_ids: p.vendor_ids || [],
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// GET /api/projects/stats/
router.get(['/stats', '/stats/'], protect, async (req, res) => {
  try {
    const all = await Project.find();
    const stats = {
      total: all.length,
      active: all.filter((p) => p.status === 'active' || p.status === 'in_progress').length,
      completed: all.filter((p) => p.status === 'completed').length,
      pending: all.filter((p) => p.status === 'pending' || p.status === 'draft').length,
      under_review: all.filter((p) => p.status === 'under_review').length,
      total_budget: all.reduce((sum, p) => sum + (p.budget || 0), 0),
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project stats' });
  }
});

// GET /api/projects/
router.get(['/', ''], protect, async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await Project.find(query).sort({ createdAt: -1 });
    res.json(projects.map(formatProject));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch projects' });
  }
});

// GET /api/projects/:id/
router.get(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const p = await Project.findById(req.params.id);
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(formatProject(p));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch project' });
  }
});

// POST /api/projects/
router.post(['/', ''], protect, async (req, res) => {
  try {
    const { title, client, priority, status, budget, start_date, end_date, description, vendor_ids, code } = req.body;
    console.log('Create project payload:', { title, vendor_ids, client });

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Project title is required' });
    }

    // Validate vendor_ids if provided - make it optional
    let validatedVendorIds = [];
    if (vendor_ids && Array.isArray(vendor_ids) && vendor_ids.length > 0) {
      const { Vendor } = require('../models');
      // Clean vendor_ids (handle string IDs from select)
      const cleanVendorIds = vendor_ids.map(id => typeof id === 'string' ? id.trim() : id).filter(id => id);
      console.log('Cleaned vendor IDs:', cleanVendorIds);

      const validVendors = await Vendor.find({ _id: { $in: cleanVendorIds } });
      console.log('Valid vendors found:', validVendors.length);

      // Only use valid vendors - don't fail if none found
      if (validVendors.length > 0) {
        validatedVendorIds = validVendors.map(v => v._id);
      }
    }

    const project = await Project.create({
      title: title.trim(),
      code: code || `PRJ-${String(Date.now()).slice(-4)}`,
      client: client || null,
      priority: priority || 'medium',
      status: status || 'active',
      budget: Number(budget) || 0,
      start_date: start_date || null,
      end_date: end_date || null,
      description: description || '',
      vendor_ids: validatedVendorIds,
      business: req.user?.business || null,
    });

    console.log('Project created with vendor_ids:', project.vendor_ids);
    res.status(201).json({ success: true, data: formatProject(project) });
  } catch (err) {
    console.error('Create project error:', err);
    console.error('Error message:', err.message);
    console.error('Error code:', err.code);
    res.status(500).json({ success: false, message: err.message || 'Failed to create project' });
  }
});

// PATCH /api/projects/:id/
router.patch(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    const p = await Project.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!p) return res.status(404).json({ message: 'Project not found' });
    res.json(formatProject(p));
  } catch (err) {
    res.status(500).json({ message: 'Failed to update project' });
  }
});

// DELETE /api/projects/:id/
router.delete(['/:id', '/:id/'], protect, async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete project' });
  }
});

// POST /api/projects/:id/assign-vendor/
router.post(['/:id/assign-vendor', '/:id/assign-vendor/'], protect, async (req, res) => {
  try {
    const { vendor_id, role } = req.body;
    const projectId = req.params.id;

    if (!vendor_id) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Check if vendor already assigned
    if (project.vendor_ids && project.vendor_ids.includes(vendor_id)) {
      return res.status(400).json({ success: false, message: 'Vendor already assigned to this project' });
    }

    // Add vendor to project
    project.vendor_ids = project.vendor_ids || [];
    project.vendor_ids.push(vendor_id);
    await project.save();

    res.json({ success: true, message: 'Vendor assigned successfully', data: formatProject(project) });
  } catch (err) {
    console.error('Assign vendor error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to assign vendor' });
  }
});

// DELETE /api/projects/:id/remove-vendor/:vendorId
router.delete(['/:id/remove-vendor/:vendorId', '/:id/remove-vendor/:vendorId/'], protect, async (req, res) => {
  try {
    const { id: projectId, vendorId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    // Remove vendor from project
    project.vendor_ids = (project.vendor_ids || []).filter(id => id.toString() !== vendorId);
    await project.save();

    res.json({ success: true, message: 'Vendor removed successfully', data: formatProject(project) });
  } catch (err) {
    console.error('Remove vendor error:', err);
    res.status(500).json({ success: false, message: err.message || 'Failed to remove vendor' });
  }
});

module.exports = router;
