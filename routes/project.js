/* eslint-disable no-console */
const router = require('express').Router();
const deepai = require('deepai');
const cloudinary = require('cloudinary').v2; // Make sure to use v2
const uuidAPIKey = require('uuid-apikey');
const verify = require('./verifyToken');
const Project = require('../schemas/project');
const User = require('../schemas/user');
const Team = require('../schemas/team');
const { getImageUrlWithSize } = require('../lib/image');

deepai.setApiKey(process.env.DEEP_AI_API_KEY);

// Create a project
router.post('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const { name, team: teamId } = req.body;

  const team = await Team.findOne({ _id: teamId });

  const project = await Project.create({
    name,
    _team: team || undefined,
    _createdBy: user._id,
    apiKey: uuidAPIKey.create().apiKey,
  });

  res.json({
    project,
  });
});

// Get all your projects
router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  const userTeams = await Team.find({
    'members._user': { $in: user._id },
  }).select('_id');

  const teamProjects = await Project.find({
    _team: { $in: userTeams },
  });

  const userProjects = await Project.find({
    _team: null,
    _createdBy: user._id,
  });

  res.json({
    projects: [...teamProjects, ...userProjects],
  });
});

// Get a project
router.get('/:id', verify, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id }).populate({
    path: '_createdBy _team',
    select: 'name',
  });

  if (!project) {
    res.status(400).send();
  }

  res.json({
    project,
  });
});

// Upload images
router.post('/images', async (req, res) => {
  const apiToken = req.header('api-token');

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload images to Cloudinary
  cloudinary.uploader
    .upload_stream(async (error, result) => {
      if (error) return console.error(error);

      if (result) {
        const { name, env } = req.body;

        const options = {
          useFindAndModify: false,
        };

        // Find current image in project
        const currentProject = await Project.findOne(
          { apiKey: apiToken },
          {
            images: { $elemMatch: { name, env } },
          },
          options,
        );

        // Delete current image before uploading new version
        let diff;

        if (
          currentProject
          && currentProject.images
          && currentProject.images.length
        ) {
          const currentImage = currentProject.images[0];

          const images = {
            image1: currentImage.default,
            image2: result.secure_url,
          };

          diff = await deepai.callStandardApi('image-similarity', images);

          await cloudinary.uploader.destroy(currentImage.publicId);
        }

        // Remove the image from the databse
        const project = await Project.findOneAndUpdate(
          { apiKey: apiToken },
          {
            $pull: { images: { name, env } },
          },
          options,
        );

        // Add the new image
        await project.update(
          {
            $push: {
              images: {
                default: result.secure_url,
                small: getImageUrlWithSize(result, 'sm'),
                large: getImageUrlWithSize(result, 'lg'),
                publicId: result.public_id,
                name,
                env,
                diff: diff ? diff.output.distance !== 0 : false,
              },
            },
          },
          options,
        );

        res.json({
          project,
        });
      }
    })
    .end(Buffer.from(req.body.image));
});

// Delete a project
router.delete('/:id', verify, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const project = await Project.findOne({ _id: id });

  if (project._team) {
    const userTeams = await Team.find({
      'members._user': { $in: user._id },
    }).select('_id members');

    const userAdminTeams = userTeams.filter((team) => team.members.find(
      (member) => String(member._user) === user._id && member.role === 'admin',
    ));

    await Project.deleteOne({
      _id: id,
      _team: { $in: userAdminTeams },
    }).catch(() => res.status(401));

    res.json();
  } else {
    await Project.deleteOne({
      _id: id,
      _createdBy: user._id,
    }).catch(() => res.status(401));

    res.json();
  }
});

// Update project
router.patch('/:id', verify, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, _createdBy: req.user._id },
    req.body,
    { new: true, useFindAndModify: false },
  );

  res.json({
    project,
  });
});

// Update project token
router.patch('/:id/updateToken', verify, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, _createdBy: req.user._id },
    { apiKey: uuidAPIKey.create().apiKey },
    { new: true, useFindAndModify: false },
  );

  res.json({
    project,
  });
});

module.exports = router;
