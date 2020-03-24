const template = require('./default')
const button = require('./button')
const { clientUrl } = require('../env')

module.exports = (name) => {
  return template(`
    <h1>Welcome to ui-diff ${name}!</h1>
    <p>We're really glad you're finally onboard on ui-diff. We promise we will help you improve your frontend screenshot testing. To get started, how about we start with some documentation?</p>
    ${button('Read documentation', `${clientUrl}/documentation`)}
  `)
}