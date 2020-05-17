const template = require('./default');
const button = require('./button');
const { clientUrl } = require('../env');

module.exports = (invitationId, teamName) => {
  const invitationLink = `${clientUrl}/invitations/${invitationId}`;

  return template(`
    <h1>You've been invited to ${teamName} on ui-diff!</h1>
    <p>To get up and running using ui-diff, click the button below to accept the invitation.</p>
    ${button('Accept invitation', invitationLink)}
    <p>Don't see or can't click the button? Click/copy this link instead: <a href="${invitationLink}">${invitationLink}</a></p>
  `);
};
