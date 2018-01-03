const BaaS = require('./baas')
const baasRequest = require('./baasRequest').baasRequest
const constants = require('./constants')

const API = BaaS._config.API

function makeParams(formID) {
  if (!formID) {
    throw new Error(constants.MSG.ARGS_ERROR)
  }

  let paramsObj = {}
  paramsObj['submission_type'] = 'form_id'
  paramsObj['submission_value'] = formID

  return paramsObj
}

const wxReportTicket = (formID) => {
  let paramsObj = makeParams(formID)

  return baasRequest({
    url: API.TEMPLATE_MESSAGE,
    method: 'POST',
    data: paramsObj,
  })
}

module.exports = {
  makeParams,
  wxReportTicket
}