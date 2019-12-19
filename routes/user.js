const router = require("express").Router();
const verify = require("./verifyToken");
const User = require("../schemas/user");
const Team = require("../schemas/team");

router.get("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const teams = await Team.find({ members: { $in: user._id } });

  res.json({
    user: {
      ...user.toObject(),
      teams
    }
  });
});

module.exports = router;
