const crypto = require('crypto')

class Service {
  constructor (options) {
    this.store = {}
  }
  find () {
    return Promise.resolve(Object.keys(this.store).map(i => this.store[i]))
  }
  get (id) {
    return Promise.resolve(this.store[id])
  }
  create (data) {
    let id = data.id = crypto.randomBytes(16).toString('hex')
    this.store[id] = data
    return Promise.resolve(data)
  }
  patch (id, data) {
    this.store[id] = {
      ...this.store[id],
      ...data
    }
    return Promise.resolve(this.store[id])
  }
  update (id, data) {
    this.store[id] = data
    return Promise.resolve(data)
  }
  remove (id) {
    let data = this.store[id]
    delete this.store[id]
    return Promise.resolve(data)
  }
}
module.exports = (options) => new Service(options)

module.exports.Service = Service
