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

  let multipleUpload = new Promise(async (resolve, reject) => {
    let upload_res = new Array();
    let upload_len = req.body.images.length;

    req.body.images.forEach(image => {
      cloudinary.uploader
        .upload_stream(function(error, result) {
          if (error) return console.error(error);

          if (result) {
            upload_res.push(result);

            if (upload_res.length === upload_len) {
              resolve(upload_res);
            }
          } else if (error) {
            console.log(error);
            reject(error);
          }
        })
        .end(Buffer.from(image));
    });
  })
    .then(result => result)
    .catch(error => {
      console.log({
        error
      });
      return error;
    });

  let images = await multipleUpload;

  await Project.findOneAndUpdate(
    { apiKey: apiToken },
    {
      images
    },
    {
      useFindAndModify: false
    }
  );

  res.json({ images });
});

module.exports = router;
