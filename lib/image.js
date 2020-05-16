/* eslint-disable no-console */
const deepai = require('deepai');
const cloudinary = require('cloudinary').v2; // Make sure to use v2
const Project = require('../schemas/project');
const cloudinaryConfig = require('../cloudinaryConfig');

// Config for DeepAI and Cloudinary
deepai.setApiKey(process.env.DEEP_AI_API_KEY);
cloudinary.config(cloudinaryConfig);

function getImageUrlWithSize(result, wantedSize) {
  const defaultUrl = 'https://res.cloudinary.com/albin-groen/image/upload';

  const urlWithCustomWidth = (width) => `${defaultUrl}/w_${width}/v${result.version}/${result.public_id}.jpg`;

  const sizes = {
    sm: urlWithCustomWidth(0.5),
    lg: urlWithCustomWidth(1.5),
  };

  return sizes[wantedSize] || '';
}

const uploadImageToCloudinary = (image) => new Promise((resolve, reject) => {
  cloudinary.uploader
    .upload_stream((err, res) => {
      if (err) return reject(err);
      return resolve(res);
    })
    .end(image);
});

const uploadProjectScreenshot = async (image, metadata, apiToken) => {
  // Upload images to Cloudinary
  const uploadedImage = await uploadImageToCloudinary(Buffer.from(image));

  if (uploadedImage) {
    const { name, env } = metadata;

    const options = {
      useFindAndModify: false,
    };

    // Find current image in project
    const currentProject = await Project.findOne(
      { apiKey: apiToken },
      {
        images: { $elemMatch: { name, env } },
      },
      options,
    );

    // Delete current image before uploading new version
    let diff;

    if (
      currentProject
      && currentProject.images
      && currentProject.images.length
    ) {
      const currentImage = currentProject.images[0];

      const images = {
        image1: currentImage.default,
        image2: uploadedImage.secure_url,
      };

      diff = await deepai.callStandardApi('image-similarity', images);

      await cloudinary.uploader.destroy(currentImage.publicId);
    }

    // Remove the image from the databse
    const project = await Project.findOneAndUpdate(
      { apiKey: apiToken },
      {
        $pull: { images: { name, env } },
      },
      options,
    );

    // Add the new image
    await project.update(
      {
        $push: {
          images: {
            default: uploadedImage.secure_url,
            small: getImageUrlWithSize(uploadedImage, 'sm'),
            large: getImageUrlWithSize(uploadedImage, 'lg'),
            publicId: uploadedImage.public_id,
            name,
            env,
            diff: diff ? diff.output.distance !== 0 : false,
          },
        },
      },
      options,
    );

    return project;
  }
};

module.exports = {
  getImageUrlWithSize,
  uploadImageToCloudinary,
  uploadProjectScreenshot,
};
