const style = "background-color: #1b1f23; padding: 14px 20px; font-size: 16px; border-radius: 5px; text-decoration: none; display: block; max-width: 150px; margin: 32px auto; text-align: center; color: white;"

module.exports = (value, link) => `
  <a style="${style}" href="${link}">${value}</a>
`