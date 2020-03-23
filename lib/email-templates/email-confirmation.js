const button = require('./button')

module.exports = (link) => `
  <div style="text-align: center;">
    <h1>Confirm your email adress</h1>
    Click here to get confirm your email:
    ${button('Verify email', link)}
  </div>
`