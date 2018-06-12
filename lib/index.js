const Ajv = require('ajv')

const AJV_OPTIONS = {
  removeAdditional: true
}

module.exports = function dbValidator (options) {
  if (!options) {
    throw new Error('FeathersDBValidator options must be provided.')
  }

  // Setup schema
  const schema = options.Model ? options.Model.schema : options.schema
  if (!schema) throw new Error('FeathersDBValidator options must provide a schema or a Model that contains a schema.')

  const ajv = new Ajv({ ...AJV_OPTIONS, ...options.ajvOptions })
  const validateCreate = ajv.compile(schema)
  const validatePatch = ajv.compile({ ...schema, required: [] })

  // Setup timestamp stuff
  const addTimestamps = options.addTimestamps
  const fieldCreatedAt = options.fieldCreatedAt || 'createdAt'
  const fieldUpdatedAt = options.fieldUpdatedAt || 'updatedAt'
  const timestampStrings = options.timestampStrings

  const db = options.db(options)

  // Patch functions
  const _create = db.create
  db.create = function (data, params) {
    let validateErrors = null

    const processData = item => {
      if (addTimestamps) {
        item[fieldCreatedAt] = timestampStrings ? (new Date()).toISOString() : Date.now()
        item[fieldUpdatedAt] = timestampStrings ? (new Date()).toISOString() : Date.now()
      }

      if (!validateCreate(item)) {
        validateErrors = validateErrors || []
        validateErrors.push(...validateCreate.errors.map(e => e.message + ' in ' + e.dataPath))
      }

      return item
    }

    data = Array.isArray(data) ? data.map(processData) : processData(data)

    if (validateErrors) {
      throw new Error(`Data failed validation: ${validateErrors.join(', ')}`)
    }

    return _create.call(this, data, params)
  }

  const _patch = db.patch
  db.patch = function (id, data, params) {
    if (addTimestamps) {
      data[fieldUpdatedAt] = timestampStrings ? (new Date()).toISOString() : Date.now()
    }

    if (!validatePatch(data)) {
      throw new Error(`Data failed validation: ${validatePatch.errors.map(e => e.message + ' in ' + e.dataPath).join(', ')}`)
    }

    return _patch.call(this, id, data, params)
  }

  const _update = db.update
  db.update = function (id, data, params) {
    if (addTimestamps) {
      data[fieldCreatedAt] = timestampStrings ? (new Date()).toISOString() : Date.now()
      data[fieldUpdatedAt] = timestampStrings ? (new Date()).toISOString() : Date.now()
    }

    if (!validateCreate(data)) {
      throw new Error(`Data failed validation: ${validateCreate.errors.map(e => e.message + ' in ' + e.dataPath).join(', ')}`)
    }

    return _update.call(this, id, data, params)
  }

  return db
}
