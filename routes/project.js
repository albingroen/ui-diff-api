const router = require("express").Router();
const cloudinary = require("cloudinary").v2; // Make sure to use v2
const uuidAPIKey = require("uuid-apikey");
const verify = require("./verifyToken");
const Project = require("../schemas/project");
const User = require("../schemas/user");

router.post("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const { name } = req.body;

  const project = await Project.create({
    name,
    _createdBy: user._id,
    apiKey: uuidAPIKey.create().apiKey
  });

  res.json({
    project
  });
});

router.get("/", verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });

  const projects = await Project.find({
    _createdBy: user._id
  });

  res.json({
    projects
  });
});

router.get("/:id", verify, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.id });

  res.json({
    project
  });
});

router.post("/images", async (req, res) => {
  const apiToken = req.header("api-token");

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });

  cloudinary.uploader
    .upload_stream(async function(error, result) {
      if (error) return console.error(error);

      if (result) {
        const { name, env } = req.body;

        const project = await Project.findOneAndUpdate(
          { apiKey: apiToken },
          {
            $pull: { images: { name, env } }
          },
          {
            useFindAndModify: false
          }
        );

        await project.update(
          {
            $push: { images: { url: result.url, name, env } }
          },
          {
            useFindAndModify: false
          }
        );

        res.json({
          project
        });
      }
    })
    .end(Buffer.from(req.body.image));
});

module.exports = router;
