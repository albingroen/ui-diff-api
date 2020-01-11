const router = require("express").Router();
const verify = require("./verifyToken");
const Team = require("../schemas/team");

// Create a team
router.post("/", verify, async (req, res) => {
  const { name } = req.body;

  const team = await Team.create({
    name,
    members: [
      {
        role: "admin",
        _user: req.user._id
      }
    ],
    _createdBy: req.user._id
  });

  res.json({
    team
  });
});

// Get a specific team
router.get("/:id", verify, async (req, res) => {
  const team = await Team.findOne({
    _id: req.params.id,
    "members._user": { $in: req.user._id }
  }).populate("members._user");

  const teamWithUserRole = {
    ...team.toObject(),
    role: team.members.find(member => String(member._user._id) === req.user._id)
      .role
  };

  res.json({
    team: teamWithUserRole
  });
});

// Get a users teams
router.get("/", verify, async (req, res) => {
  const teams = await Team.find({
    "members._user": { $in: req.user._id }
  });

  res.json({
    teams
  });
});

// Update team
router.patch("/:id", verify, async (req, res) => {
  const team = await Team.findOneAndUpdate(
    {
      _id: req.params.id,
      "members._user": { $in: req.user._id }
    },
    req.body
  ).populate("members._user");

  res.json({
    team
  });
});

// Update member
router.patch("/:id/update-member", verify, async (req, res) => {
  const team = await Team.findOneAndUpdate(
    {
      _id: req.params.id,
      "members._user": { $in: req.body.userId }
    },
    {
      $set: { "members.$.role": req.body.newRole }
    }
  ).populate("members._user");

  res.json({
    team
  });
});

module.exports = router;
