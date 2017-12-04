const Koa = require('koa');
const indexRoutes = require('./routes/index');

const app = new Koa();
const PORT = 3000;

app.use(indexRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

module.exports = server;