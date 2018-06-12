const Ajv = require('ajv')

const AJV_OPTIONS = {
  removeAdditional: true
}

// Create the service
class Service {
  constructor (options) {
    if (!options) {
      throw new Error('FeathersDBValidator options must be provided.')
    }

    this.db = options.db(options)

    let schema = options.Model ? options.Model.schema : options.schema
    if (!schema) throw new Error('FeathersDBValidator options must provide a schema or a Model that contains a schema.')

    let ajv = new Ajv({ ...AJV_OPTIONS, ...options.ajvOptions })
    this.validateCreate = ajv.compile(schema)
    this.validatePatch = ajv.compile({ ...schema, required: [] })

    this.addTimestamps = options.addTimestamps
    this.fieldCreatedAt = options.fieldCreatedAt || 'createdAt'
    this.fieldUpdatedAt = options.fieldUpdatedAt || 'updatedAt'
    this.timestampStrings = options.timestampStrings
  }

  find (params) {
    return this.db.find(params)
  }

  get (id, params) {
    return this.db.get(id, params)
  }

  create (data, params) {
    let validateErrors = null

    const processData = item => {
      if (this.addTimestamps) {
        item[this.fieldCreatedAt] = this.timestampStrings ? (new Date()).toISOString() : Date.now()
        item[this.fieldUpdatedAt] = this.timestampStrings ? (new Date()).toISOString() : Date.now()
      }

      if (!this.validateCreate(item)) {
        validateErrors = validateErrors || []
        validateErrors.push(...this.validateCreate.errors.map(e => e.message + ' in ' + e.dataPath))
      }

      return item
    }

    let processedData = Array.isArray(data) ? data.map(processData) : processData(data)

    if (validateErrors) {
      throw new Error(`Data failed validation: ${validateErrors.join(', ')}`)
    }

    return this.db.create(processedData, params)
  }

  patch (id, data, params) {
    if (this.addTimestamps) {
      data[this.updatedTimestamp] = this.timestampStrings ? (new Date()).toISOString() : Date.now()
    }

    if (!this.validatePatch(data)) {
      throw new Error(`Data failed validation: ${this.validatePatch.errors.map(e => e.message + ' in ' + e.dataPath).join(', ')}`)
    }

    return this.db.patch(id, data, params)
  }

  update (id, data, params) {
    if (this.addTimestamps) {
      data[this.updatedTimestamp] = this.timestampStrings ? (new Date()).toISOString() : Date.now()
    }

    if (!this.validateCreate(data)) {
      throw new Error(`Data failed validation: ${this.validateCreate.errors.map(e => e.message + ' in ' + e.dataPath).join(', ')}`)
    }

    return this.db.update(id, data, params)
  }

  remove (id, params) {
    return this.db.remove(id, params)
  }
}

module.exports = (options) => new Service(options)

module.exports.Service = Service
