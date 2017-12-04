process.env.NODE_ENV = 'test';

const chai = require('chai');
const should = chai.should();

const chaiHttp = require('chai-http');
chai.use(chaiHttp);

const server = require('../src/server/index');
const knex = require('../src/server/db/connection')

describe('routes : movies', () => {
  beforeEach(() => {
    return knex.migrate.rollback()
      .then(() => knex.migrate.latest())
      .then(() => knex.seed.run());
  });

  afterEach(() => knex.migrate.rollback);

  describe('GET /api/v1/movies', () => {
    it('should return all movies', (done) => {
      chai.request(server)
        .get('/api/v1/movies')
        .end((err, res) => {
          should.not.exist(err); // there should be no object with errors
          res.status.should.equal(200); // status code as 200 - happy
          res.type.should.equal('application/json'); // body as json
          res.body.status.should.eql('success');
          res.body.data.length.should.eql(3);
          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          done();
        });
    });
  });

  describe('GET /api/v1/movies/:id', () => {
    it('should response with single movie', (done) => {
      chai.request(server)
        .get('/api/v1/movies/1')
        .end((err, res) => { 
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('application/json');
          res.body.status.should.eql('success');
          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          done();
        });
    });

    it('should throw an error if the movie does not exist', (done) => {
      chai.request(server)
        .get('/api/v1/movies/2137')
        .end((err, res) => {
          should.exist (err);
          res.status.should.equal(404);
          res.type.should.equal('application/json');
          res.body.status.should.eql('error');
          res.body.message.should.eql('That movie does not exist.');
          done();
        });
    });
  });

  describe('POST /api/v1/movies', () => { 
    it('should return the movie that was added', (done) => {
      chai.request(server)
        .post('/api/v1/movies')
        .send({
          name: 'Titanic',
          genre: 'Drama',
          rating: 9,
          explicit: true
        })
        .end((err, res) => {
          should.not.exist(err);

          res.status.should.equal(201);
          res.type.should.equal('application/json');
          res.body.status.should.eql('success');

          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          done();
        });
    });

    it('should throw an error if the payload is malformed', (done) => {
      chai.request(server)
      .post('/api/v1/movies')
      .send({ 
        name: 'Titstanic'
      })
      .end((err, res) => { 
        should.exist(err);
        res.status.should.equal(400);
        res.type.should.equal('application/json');
        res.body.status.should.eql('error');
        should.exist(res.body.message);
        done();
      });
    });
  });

  describe('Put /api/v1/movies', () => {
    it('should return the movie that was updated', (done) => {
      knex('movies')
      .select('*')
      .then((movies) => {
        const movieObject = movies[0];
        chai.request(server)
        .put(`/api/v1/movies/${movieObject.id}`)
        .send({
          rating: 9
        })
        .end((err, res) => {
          should.not.exist(err);
          res.status.should.equal(200);
          res.type.should.equal('application/json');
          res.body.status.should.eql('success');

          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );
          
          const newMovieObject = res.body.data[0];
          newMovieObject.rating.should.not.eql(movieObject.rating);
          done();
        });
      });
    });

    it('should throw an error if the movie does not exist', (done) => {
      chai.request(server)
      .put('/api/v1/movies/2137')
      .send({
        rating: 133
      })
      .end((err, res) => {
        should.exist(err);

        res.status.should.equal(404);
        res.type.should.equal('application/json');
        res.body.status.should.eql('error');

        res.body.message.should.eql('That movie does not exist.');
        done();
      });
    });
  });

  describe('DELETE /api/v1/movies/:id', () => {
    it('should return the movie that was deleted', (done) => {
      knex('movies')
      .select('*')
      .then((movies) => {
        const movieObject = movies[0];
        const lengthBeforeDelete = movies.length;
        chai.request(server)
        .delete(`/api/v1/movies/${movieObject.id}`)
        .end((err, res) => {
          should.not.exist(err);

          res.status.should.equal(200);

          res.type.should.equal('application/json');
          res.body.status.should.eql('success');
          res.body.data[0].should.include.keys(
            'id', 'name', 'genre', 'rating', 'explicit'
          );

          knex('movies').select('*')
          .then((updatedMovies) => {
            updatedMovies.length.should.eql(lengthBeforeDelete - 1);
            done();
          });
        });
      });
    });

    it('should throw an error if the movie does not exist', (done) => {
      chai.request(server)
      .delete('/api/v1/movies/2137')
      .end((err, res) => {
        should.exist(err);

        res.status.should.equal(404);
        res.type.should.equal('application/json');

        res.body.status.should.eql('error');

        res.body.message.should.eql('That movie does not exist.');
        done();
      });
    });
  });
});