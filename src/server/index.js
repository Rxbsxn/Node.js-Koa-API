const Koa = require('koa');
const bodyParser = require('koa-bodyparser');

const indexRoutes = require('./routes/index');
const moviesRoutes = require('./routes/movies');

const app = new Koa();
const PORT = 3000;

app.use(bodyParser());
app.use(indexRoutes.routes());
app.use(moviesRoutes.routes());

const server = app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});

module.exports = server;