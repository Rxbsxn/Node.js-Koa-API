const knex = require('../connection')

function getAllMovies() {
  return knex('movies').select('*');
}

module.exports = {
  getAllMovies
};