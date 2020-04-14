const router = require('express').Router();
const verify = require('./verifyToken');
const Team = require('../schemas/team');
const Project = require('../schemas/project');
const Invitation = require('../schemas/invitation');

// Create a team
router.post('/', verify, async (req, res) => {
  const { name } = req.body;

  const team = await Team.create({
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
    role: team.members.find((member) => String(member._user._id) === req.user._id)
      .role,
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
router.patch('/:id', verify, async (req, res) => {
  const team = await Team.findOneAndUpdate(
    {
      _id: req.params.id,
      'members._user': { $in: req.user._id },
    },
    req.body,
  ).populate('members._user');

  res.json({
    team,
  });
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
  );

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

module.exports = router;
