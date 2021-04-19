const Sequelize = require('sequelize');

const sequelize = new Sequelize('node_db', 'root', 'helloat0015', {
  dialect: 'mysql',
  host: 'localhost'
});

module.exports = sequelize;
