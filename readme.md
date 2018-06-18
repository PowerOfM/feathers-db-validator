# Feathers DB Validator

A DB wrapper that adds JSON Schema validation to all create, update and patch requests.

## Installation

```bash
$ npm add feathers-db-validator
```

## Usage

The DB Validator is used like any FeathersJS service adapter, and takes in one argument: options.
```js
const createService = require('feathers-db-validator')
const FeathersNeDB = require('feathers-nedb')
const usersSchema = require('./users-schema.json')

module.exports = function () {
  const app = this
  
  app.use('/users', createService({
    app,
    name: 'users',
    db: FeathersNeDB,
    schema: usersSchema
  })
  app.service('users')
}
```

**Options**:
- **`app`** - FeathersJS app instance
- **`db`** - FeathersJS database service wrapper (such as NeDB, MongoDB, or PostgreSQL)
- `schema` - JSON schema to use for validation
- `Model` - Passed to database service wrapper; if it has a `schema` property this is used instead of `schema`
- `addTimestamps` - If true, db validator will add "createdAt" and "updatedAt" timestamps on create, patch and update as required. Customize the field names using the parameters below. (Default: false)
- `fieldCreatedAt` - Name of the timestamp field set when models are created (default: "createdAt")
- `fieldCreatedAt` - Name of the timestamp field set when models are updated or patched (default: "updatedAt")

> **`Bold`** = required. Also, `schema` or `Model.schema` must be defined.

> Any additional options are passed directly to the database service.

## Licence

Copyright (c) 2018 Mesbah Mowlavi.

Licensed under the [MIT license](LICENSE).


