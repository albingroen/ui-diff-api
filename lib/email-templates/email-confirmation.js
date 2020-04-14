const template = require('./default');
const button = require('./button');

module.exports = (link) => template(`
    <h1>Please confirm your email</h1>
    <p>Yes, we know.</p>
    <p>Yet another email to confirm 🙃</p>
    <p>Please validate your email address in order to get started with ui-diff.</p>
    ${button('Verify email', link)}
  `);
