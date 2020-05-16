const router = require('express').Router();
const cloudinary = require('cloudinary').v2; // Make sure to use v2
const verify = require('./verifyToken');
const Team = require('../schemas/team');
const Project = require('../schemas/project');
const Invitation = require('../schemas/invitation');
const cloudinaryConfig = require('../cloudinaryConfig');
const { multerUploads } = require('../multer');

// Create a team
router.post('/', verify, async (req, res) => {
  const { name } = req.body;

  let team = await Team.create({
    name,
    members: [
      {
        role: 'admin',
        _user: req.user._id,
      },
    ],
    _createdBy: req.user._id,
    logo: `https://eu.ui-avatars.com/api/?name=${name}`,
  });

  team = await team.populate('members._user').execPopulate();

  res.json({
    team,
  });
});

// Get team projects
router.get('/:id/projects', verify, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const team = await Team.findOne({
    _id: id,
    'members._user': { $in: user._id },
  });

  const projects = await Project.find({ _team: team._id });

  res.json({
    projects,
  });
});

// Get a specific team
router.get('/:id', verify, async (req, res) => {
  const team = await Team.findOne({
    _id: req.params.id,
    'members._user': { $in: req.user._id },
  }).populate('members._user');

  const teamWithUserRole = {
    ...team.toObject(),
    role: team.members.find(
      (member) => String(member._user._id) === req.user._id,
    ).role,
  };

  res.json({
    team: teamWithUserRole,
  });
});

// Get a users teams
router.get('/', verify, async (req, res) => {
  const teams = await Team.find({
    'members._user': { $in: req.user._id },
  });

  res.json({
    teams,
  });
});

// Update team
router.patch('/:id', verify, multerUploads, async (req, res) => {
  if (req.file) {
    cloudinary.config(cloudinaryConfig);

    cloudinary.uploader
      .upload_stream(async (error, result) => {
        const team = await Team.findOneAndUpdate(
          {
            _id: req.params.id,
            'members._user': { $in: req.user._id },
          },
          {
            ...req.body,
            ...(result
              ? {
                logo: result.secure_url,
              }
              : {}),
          },
          { new: true },
        ).populate('members._user');

        res.json({
          team,
        });
      })
      .end(Buffer.from(req.file.buffer));
  } else {
    const team = await Team.findOneAndUpdate(
      {
        _id: req.params.id,
        'members._user': { $in: req.user._id },
      },
      req.body,
      { new: true },
    ).populate('members._user');

    res.json({
      team,
    });
  }
});

// Update member
router.patch('/:id/update-member', verify, async (req, res) => {
  const team = await Team.findOneAndUpdate(
    {
      _id: req.params.id,
      'members._user': { $in: req.body.userId },
    },
    {
      $set: { 'members.$.role': req.body.newRole },
    },
    {
      new: true,
    },
  ).populate('members._user');

  res.json({
    team,
  });
});

// Delete member
router.patch('/:id/delete-member', verify, async (req, res) => {
  const team = await Team.findOneAndUpdate(
    {
      _id: req.params.id,
      'members._user': { $in: req.body.userId },
    },
    {
      $pull: { members: { _user: req.body.userId } },
    },
    {
      new: true,
    },
  ).populate('members._user');

  res.json({
    team,
  });
});

// Get team invitations
router.get('/:id/invitations', verify, async (req, res) => {
  const team = await Team.findOne({
    _id: req.params.id,
    'members._user': { $in: req.user._id },
  }).populate('members._user');

  const invitations = await Invitation.find({
    _team: team._id,
    active: true,
  });

  res.json({
    invitations,
  });
});

// Delete a team
router.delete('/:id', verify, async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  await Team.deleteOne({
    _id: id,
    'members._user': { $in: user._id },
    'members.role': 'admin',
  }).catch(() => res.status(401));

  res.json({
    isTeamDeleted: true,
  });
});

module.exports = router;
