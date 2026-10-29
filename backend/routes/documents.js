const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

let documentsStore = [];

router.get(['/', ''], protect, (req, res) => {
  res.json(documentsStore);
});

router.get(['/:id', '/:id/'], protect, (req, res) => {
  const doc = documentsStore.find((d) => String(d.id) === String(req.params.id));
  if (!doc) return res.status(404).json({ message: 'Document not found' });
  res.json(doc);
});

router.post(['/', ''], protect, (req, res) => {
  const newDoc = {
    id: `DOC-${Date.now()}`,
    title: req.body?.title || 'Uploaded Document',
    access_level: req.body?.access_level || 'project_members',
    project: req.body?.project || null,
    createdAt: new Date().toISOString(),
  };
  documentsStore.unshift(newDoc);
  res.status(201).json(newDoc);
});

router.delete(['/:id', '/:id/'], protect, (req, res) => {
  documentsStore = documentsStore.filter((d) => String(d.id) !== String(req.params.id));
  res.json({ success: true, message: 'Document deleted' });
});

module.exports = router;
