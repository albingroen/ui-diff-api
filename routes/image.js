/* eslint-disable no-console */
const deepai = require('deepai');
const cloudinary = require('cloudinary').v2; // Make sure to use v2
const Project = require('../schemas/project');
const { getImageUrlWithSize } = require('../lib/image');

deepai.setApiKey(process.env.DEEP_AI_API_KEY);

const uploadProjectScreenshot = (image, metadata, apiToken) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Upload images to Cloudinary
  cloudinary.uploader
    .upload_stream(async (error, result) => {
      if (error) return console.error(error);

      if (result) {
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
            image2: result.secure_url,
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
                default: result.secure_url,
                small: getImageUrlWithSize(result, 'sm'),
                large: getImageUrlWithSize(result, 'lg'),
                publicId: result.public_id,
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
    })
    .end(Buffer.from(image));
};

module.exports = {
  uploadProjectScreenshot,
};
