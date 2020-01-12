const router = require("express").Router();
const verify = require("./verifyToken");
const Invitation = require("../schemas/invitation");
const Team = require("../schemas/team");

// Create a invitation
router.post("/", verify, async (req, res) => {
  const { email, role, teamId } = req.body;

  const team = await Team.findOne({
    _id: req.body.teamId,
    "members._user": { $in: req.user._id }
  });

  const invitation = await Invitation.create({
    email,
    role,
    active: true,
    _team: team._id
  }).populate("_team");

  res.json({
    invitation
  });
});

// Get a invitation
router.get("/:id", async (req, res) => {
  if (!req.params.id || req.params.id === "undefined") {
    return res.json({});
  }

  const invitation = await Invitation.findOne({
    _id: req.params.id,
    active: true
  })
    .populate("_team")
    .catch(() => res.json({}));

  res.json({
    invitation
  });
});

// Accept invitation
router.patch("/:id", async (req, res) => {
  const { userId } = req.body;

  const invitation = await Invitation.findOneAndUpdate(
    {
      _id: req.params.id
    },
    {
      active: false
    },
    {
      new: true
    }
  );

  await Team.findOneAndUpdate(
    {
      _id: invitation._team
    },
    {
      $push: {
        members: {
          _user: userId,
          role: invitation.role
        }
      }
    }
  );

  res.json({
    invitation
  });
});

module.exports = router;
