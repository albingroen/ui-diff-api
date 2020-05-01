const router = require('express').Router();
const verify = require('./verifyToken');
const Invitation = require('../schemas/invitation');
const { sendMail } = require('../lib/mail');
const Team = require('../schemas/team');

// Create a invitation
router.post('/', verify, async (req, res) => {
  const { email, role } = req.body;

  const team = await Team.findOne({
    _id: req.body.teamId,
    'members._user': { $in: req.user._id },
  });

  const invitation = await Invitation.create({
    email,
    role,
    active: true,
    _team: team._id,
  });

  sendMail(
    email,
    `You've been invited to ${team.name} on ui-diff!`,
    `Welcome to ui-diff! Click the link to get up and running: https://app.ui-diff.com/login?invitation=${invitation._id}`,
  );

  res.json({
    invitation,
  });
});

// Get a invitation
router.get('/:id', async (req, res) => {
  if (!req.params.id || req.params.id === 'undefined') {
    return res.json({});
  }

  const invitation = await Invitation.findOne({
    _id: req.params.id,
    active: true,
  })
    .populate('_team')
    .catch(() => res.json({}));

  res.json({
    invitation,
  });
});

// Accept invitation
router.patch('/:id', async (req, res) => {
  const { userId } = req.body;

  const invitation = await Invitation.findOneAndUpdate(
    {
      _id: req.params.id,
    },
    {
      active: false,
    },
    {
      new: true,
    },
  );

  await Team.findOneAndUpdate(
    {
      _id: invitation._team,
    },
    {
      $push: {
        members: {
          _user: userId,
          role: invitation.role,
        },
      },
    },
  );

  res.json({
    invitation,
  });
});

// Delete invitation
router.delete('/:id', verify, async (req, res) => {
  const { id } = req.params;

  if (!id) {
    res.status(400);
    return res.json();
  }

  const userTeams = await Team.find({
    'members._user': { $in: req.user._id },
  });

  await Invitation.findOneAndDelete({ _id: id, _team: { $in: userTeams } });

  res.json();
});

module.exports = router;
