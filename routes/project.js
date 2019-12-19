const router = require("express").Router();
const cloudinary = require("cloudinary").v2; // Make sure to use v2
const uuidAPIKey = require("uuid-apikey");
const verify = require("./verifyToken");
const Project = require("../schemas/project");
const User = require("../schemas/user");
const Team = require("../schemas/team");

// Create a project
router.post("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const { name, team } = req.body;

  const project = await Project.create({
    name,
    _team: team,
    _createdBy: user._id,
    apiKey: uuidAPIKey.create().apiKey
  });

  res.json({
    project
  });
});

// Get all your projects
router.get("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  const userTeams = await Team.find({ members: { $in: user._id } }).select(
    "_id"
  );

  const teamProjects = await Project.find({
    _team: { $in: userTeams }
  });

  const userProjects = await Project.find({
    _team: null,
    _createdBy: user._id
  });

  res.json({
    projects: [...teamProjects, ...userProjects]
  });
});

// Get a project
router.get("/:id", verify, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id }).populate(
    "_team"
  );

  res.json({
    project
  });
});

// Upload images
router.post("/images", async (req, res) => {
  const apiToken = req.header("api-token");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  // Upload images to Cloudinary
  cloudinary.uploader
    .upload_stream(async function(error, result) {
      if (error) return console.error(error);

      if (result) {
        const { name, env } = req.body;

        const options = {
          useFindAndModify: false
        };

        const project = await Project.findOneAndUpdate(
          { apiKey: apiToken },
          {
            $pull: { images: { name, env } }
          },
          options
        );

        await project.update(
          {
            $push: {
              images: { url: result.url, publicId: result.public_id, name, env }
            }
          },
          options
        );

        res.json({
          project
        });
      }
    })
    .end(Buffer.from(req.body.image));
});

// Delete a project
router.delete("/:id", verify, async (req, res) => {
  await Project.deleteOne({ _id: req.params.id, _createdBy: req.user._id });

  res.json({
    success: true
  });
});

// Update project
router.patch("/:id", verify, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, _createdBy: req.user._id },
    req.body,
    { new: true, useFindAndModify: false }
  );

  res.json({
    project
  });
});

// Update project token
router.patch("/:id/updateToken", verify, async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { _id: req.params.id, _createdBy: req.user._id },
    { apiKey: uuidAPIKey.create().apiKey },
    { new: true, useFindAndModify: false }
  );

  res.json({
    project
  });
});

module.exports = router;
