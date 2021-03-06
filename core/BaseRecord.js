const HError = require('./HError')

function _serializeValueFuncFactory(config = ['BaseRecord']) {
  const GeoPoint = require('./GeoPoint')
  const GeoPolygon = require('./GeoPolygon')

  return value => {
    if (config.includes('Geo') && (value instanceof GeoPoint || value instanceof GeoPolygon)) {
      return value.toGeoJSON()
    }
    if (config.includes('BaseRecord') && value instanceof BaseRecord) {
      return value._recordID == null ? '' : value._recordID.toString()
    } else {
      return value
    }
  }
}

class BaseRecord {
  constructor(recordID) {
    this._recordID = recordID
    this._recordValueInit()
  }

  _recordValueInit() {
    this._record = {
      $set: {},
      $unset: {},
    }
  }

  set(...args) {
    const serializeValue = _serializeValueFuncFactory(['BaseRecord', 'Geo'])
    const serializeArrayValue = _serializeValueFuncFactory(['Geo'])

    if (args.length === 1) {
      if (typeof args[0] === 'object') {
        let objectArg = args[0]
        let recordToSet = {}
        Object.keys(args[0]).forEach((key) => {
          if (this._record.$unset.hasOwnProperty(key)) {
            throw new HError(605)
          }
          let value = objectArg[key]
          if (Array.isArray(value)) {
            recordToSet[key] = value.map(item => serializeArrayValue(item))
          } else {
            recordToSet[key] = serializeValue(value)
          }
        })
        this._record.$set = recordToSet
      } else {
        throw new HError(605)
      }
    } else if (args.length === 2) {
      if (this._record.$unset.hasOwnProperty(args[0])) {
        throw new HError(605)
      }
      let value = args[1]
      if (Array.isArray(value)) {
        this._record.$set[args[0]] = value.map(item => serializeArrayValue(item))
      } else {
        this._record.$set[args[0]] = serializeValue(value)
      }
    } else {
      throw new HError(605)
    }
    return this
  }

  unset(...args) {
    if (typeof args[0] === 'object') {
      let recordToUnset = {}
      Object.keys(args[0]).forEach((key) => {
        if (this._record.$set.hasOwnProperty(key)) {
          throw new HError(605)
        }
        recordToUnset[key] = ''
      })
      this._record.$unset = recordToUnset
    } else if (typeof args[0] === 'string') {
      if (this._record.$set.hasOwnProperty(args[0])) {
        throw new HError(605)
      }
      this._record.$unset[args[0]] = ''
    } else {
      throw new HError(605)
    }
    return this
  }

  incrementBy(key, value) {
    this._record.$set[key] = {$incr_by: value}
    return this
  }

  append(key, value) {
    const serializeArrayValue = _serializeValueFuncFactory(['Geo'])
    if (!(value instanceof Array)) {
      value = [value]
    }
    value = value.map(item => serializeArrayValue(item))
    this._record.$set[key] = {$append: value}
    return this
  }

  uAppend(key, value) {
    const serializeArrayValue = _serializeValueFuncFactory(['Geo'])
    if (!(value instanceof Array)) {
      value = [value]
    }
    value = value.map(item => serializeArrayValue(item))
    this._record.$set[key] = {$append_unique: value}
    return this
  }

  remove(key, value) {
    const serializeArrayValue = _serializeValueFuncFactory(['Geo'])
    if (!(value instanceof Array)) {
      value = [value]
    }
    value = value.map(item => serializeArrayValue(item))
    this._record.$set[key] = {$remove: value}
    return this
  }

  patchObject(key, value) {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
      throw new HError(605)
    }

    this._record.$set[key] = {$update: value}
    return this
  }
}

BaseRecord._serializeValueFuncFactory = _serializeValueFuncFactory
module.exports = BaseRecord
