const router = require("express").Router();
const verify = require("./verifyToken");
const Team = require("../schemas/team");

router.post("/", verify, async (req, res) => {
  const { name } = req.body;

  const team = await Team.create({
    name,
    members: [req.user._id],
    _createdBy: req.user._id
  });

  res.json({
    team
  });
});

router.get("/:id", verify, async (req, res) => {
  const team = await Team.findOne({
    _id: req.params.id,
    members: { $in: req.user._id }
  });

  res.json({
    team
  });
});

router.get("/", verify, async (req, res) => {
  const teams = await Team.find({
    members: { $in: req.user._id }
  })

  res.json({
    teams
  })
})

module.exports = router;
