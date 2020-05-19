const router = require('express').Router();
const verify = require('./verifyToken');
const User = require('../schemas/user');
const Team = require('../schemas/team');
const { createTokens, setTokens } = require('../lib/auth');
const { sendMail } = require('../lib/mail');
const { multerUploads } = require('../multer');
const { uploadImageToCloudinary } = require('../lib/image');
const welcome = require('../lib/email-templates/welcome');

// Get user
router.get('/', verify, async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  const teams = await Team.find({
    'members._user': { $in: user._id },
  }).populate('members._user');

  res.json({
    user: {
      ...user.toObject(),
      teams,
    },
  });
});

// Patch user
router.patch('/:id', verify, multerUploads, async (req, res) => {
  let image;

  if (req.file) {
    image = await uploadImageToCloudinary(Buffer.from(req.file.buffer));
  }

  const user = await User.findOneAndUpdate(
    { _id: req.params.id },
    {
      ...req.body,
      ...(image ? { avatar: image.secure_url } : {}),
    },
    { new: true },
  );

  if (!user) {
    return res.status(400).send();
  }

  res.json({
    user,
  });
});

// Confirm user
router.post('/:id/confirm', async (req, res) => {
  const { id } = req.params;

  const user = await User.findOne({ _id: id });

  if (!user) {
    res.status(400).send({ error: 'user-not-found' });
  } else if (user.confirmed) {
    res.status(400).send({ error: 'email-already-confirmed' });
  } else {
    // Confirm user
    const updatedUser = await User.findOneAndUpdate(
      { _id: user._id },
      { confirmed: true },
      { new: true },
    );

    // Create user
    const { token, refreshToken } = createTokens(
      updatedUser,
      process.env.JWT_SECRET,
      process.env.JWT_SECRET_2,
    );

    // Set tokens
    setTokens(res, token, refreshToken);

    // Send welcome email
    sendMail(
      updatedUser.email,
      'Welcome to ui-diff!',
      welcome(updatedUser.name),
    );

    // Return user
    res.send({
      user: updatedUser,
    });
  }
});

// Delete user
router.delete('/:id', verify, async (req, res) => {
  await User.deleteOne({ _id: req.user._id });

  res.json({
    isUserDeleted: true,
  });
});

module.exports = router;
