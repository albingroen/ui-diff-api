const router = require('express').Router();
const verify = require('./verifyToken');
const {
  patchProjectToken,
  patchProject,
  deleteProject,
  getProject,
  getUserProjects,
  createProject,
} = require('../lib/project');
const { uploadProjectImage } = require('../lib/image');

// Create a project
router.post('/', verify, async (req, res) => {
  const project = await createProject(req.user._id, req.body);

  if (!project) {
    return res.status(401).send();
  }

  res.json({
    project,
  });
});

// Get all your projects
router.get('/', verify, async (req, res) => {
  const projects = await getUserProjects(req.user._id);

  if (!projects) {
    return res.status(400).send();
  }

  res.json({
    projects,
  });
});

// Get a project
router.get('/:id', verify, async (req, res) => {
  const project = await getProject(req.params.id);

  if (!project) {
    return res.status(400).send();
  }

  res.json({
    project,
  });
});

// Upload images
router.post('/images', async (req, res) => {
  const apiToken = req.header('api-token');

  const project = await uploadProjectImage(req.body.image, req.body, apiToken);

  res.json({
    project,
  });
});

// Delete a project
router.delete('/:id', verify, async (req, res) => {
  const isProjectDeleted = await deleteProject(req.params.id, req.user._id);

  if (!isProjectDeleted) {
    return res.status(401).send();
  }

  res.json({
    isProjectDeleted,
  });
});

// Update project
router.patch('/:id', verify, async (req, res) => {
  const project = await patchProject(req.params.id, req.user._id, req.body);

  if (!project) {
    return res.status(401).send();
  }

  res.json({
    project,
  });
});

// Update project token
router.patch('/:id/updateToken', verify, async (req, res) => {
  const project = await patchProjectToken(req.params.id, req.user._id);

  if (!project) {
    return res.status(401).send();
  }

  res.json({
    project,
  });
});

module.exports = router;
