/* Copyright (c) 2020 voxgig and other contributors, MIT License */
'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const EntityHistoryPlugin = require('../')

lab.test('validate', PluginValidator(EntityHistoryPlugin, module))

lab.test('plugin-load', async () => {
  return await seneca_instance(null, null).ready()
})

lab.test('happy', async () => {
})


function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use(EntityHistoryPlugin, plugin_options)
}
