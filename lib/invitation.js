const Invitation = require('../schemas/invitation');
const Team = require('../schemas/team');

const acceptInvitation = async (invitationId, userId) => {
  const invitation = await Invitation.findOneAndUpdate(
    {
      _id: invitationId,
    },
    {
      active: false,
    },
    {
      new: true,
    },
  );

  await Team.findOneAndUpdate(
    {
      _id: invitation._team,
    },
    {
      $push: {
        members: {
          _user: userId,
          role: invitation.role,
        },
      },
    },
  );

  return invitation;
};

module.exports = {
  acceptInvitation,
};
