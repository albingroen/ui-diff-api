const template = require('./default')
const button = require('./button')

module.exports = (link) => {
  return template(`
    <h1>Reset your password</h1>
    <p>We received a request to reset your password. Please create a new password by clicking the button. This link will stop working in 1 hour.</p>
    ${button('Reset password', link)}
  `)
}