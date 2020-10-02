const express = require('express');
const bodyParser = require('body-parser');
const indexRouter = require('./routes');
const app = express();
const port = process.env.PORT || 1234;
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.listen(port, (err) => {
  if (err) throw err;
  console.log(`Server is listening on port ${port}`);
});
app.use('/', indexRouter);
module.exports = app;
