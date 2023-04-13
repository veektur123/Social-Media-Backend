const { connect, connection } = require('mongoose');
require("dotenv").config()
connect(process.env.MONGOOSE_CONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = connection;
