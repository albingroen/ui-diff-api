const style = "background-color: #159739; padding: 14px; font-size: 18px; border-radius: 6px; text-decoration: none; display: inline-block; line-height: 100% !important; margin: 32px auto; text-align: center; color: white;"

module.exports = (value, link) => `
  <a style="${style}" href="${link}">${value}</a>
`