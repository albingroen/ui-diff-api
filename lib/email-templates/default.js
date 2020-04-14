const logo = require('./logo');
const footer = require('./footer');

module.exports = (content) => {
  const styles = {
    container: 'background-color: #f9f9f9 !important; padding: 24px;',
    card:
      'background-color: white !important; padding: 24px; border-radius: 3px; text-align: center; border: 1px solid #ebebeb; border-top-width: 5px; border-top-color: #222;',
  };

  return `
    <div style="${styles.container}">
      <div style="${styles.card}">
        ${logo}
        ${content}
      </div>
      ${footer}
    </div>
  `;
};
