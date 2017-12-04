const knex = require('../connection')

function getAllMovies() {
  return knex('movies').select('*');
}

function getSingleMovie(id) {
  return knex('movies').select('*').where({ id: +id })
}

function addMovie(movie) {
  return knex('movies')
  .insert(movie)
  .returning('*');
}

module.exports = {
  getAllMovies,
  getSingleMovie,
  addMovie
};