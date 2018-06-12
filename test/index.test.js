const { assert } = require('chai')
const feathers = require('@feathersjs/feathers')
const createService = require('../lib/index2')
const testDB = require('./test-db')

/* global describe, it */

describe('DB Validator Service', () => {
  const app = feathers().use('/test', createService({
    db: testDB,
    schema: {
      type: 'object',
      required: ['name'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        age: { type: 'number' }
      }
    }
  }))

  describe('ajv validation', () => {
    it('validates on create and update', () => {
      const service = app.service('test')

      return service.create({
        name: 'Valid & complete',
        age: 27
      }).then(person => {
        assert.equal(person.name, 'Valid & complete')
        assert.equal(person.age, 27)
        return service.update(person.id, { name: 'Updated valid & complete', age: 5 })
      }).then(person => {
        assert.equal(person.name, 'Updated valid & complete')
        assert.equal(person.age, 5)
      })
    })

    it('fails on invalid data', done => {
      const service = app.service('test')

      service.create({
        age: 'Invalid'
      }).then(person => {
        assert.fail(person)
      }).catch(e => {
        done()
      })
    })

    it('validates on patch', () => {
      const service = app.service('test')

      return service.create({
        name: 'Patchy'
      }).then(person => {
        return service.patch(person.id, { age: 17 })
          .then(() => service.get(person.id))
          .then(updated => {
            assert.equal(updated.name, 'Patchy')
            assert.equal(updated.age, 17)
          })
      })
    })

    it('fails on invalid patch data', done => {
      const service = app.service('test')

      service.create({
        name: 'Patchy invalid'
      })
        .then(person => service.patch(person.id, { age: 'cake' }))
        .then(person => assert.fail(person))
        .catch(() => done())
    })
  })
})
