/* Copyright (c) 2020 voxgig and other contributors, MIT License */
'use strict'

const Lab = require('@hapi/lab')
const Code = require('@hapi/code')
const lab = (exports.lab = Lab.script())
const expect = Code.expect

const PluginValidator = require('seneca-plugin-validator')
const Seneca = require('seneca')
const SenecaMsgTest = require('seneca-msg-test')

const Plugin = require('../')

lab.test('validate', PluginValidator(Plugin, module))

lab.test('plugin-load', async () => {
  return await seneca_instance(null, null).ready()
})

lab.test('happy', async () => {
  var seneca = await seneca_instance()
  
  let b01 = await seneca.entity('zed/bar', {x:1,y:'Y1'}).save$()

  await seneca.ready() // history saving is parallel
  let hl0 = await seneca.post('sys:enthist,enthist:list',{ent:b01})
  console.log('hl0', hl0)


  b01.x = 2
  await b01.save$()
  
  await seneca.ready() // history saving is parallel
  let hl1 = await seneca.post('sys:enthist,enthist:list',{ent:b01})
  console.log('hl1', hl1)
})

lab.test('messages', async () => {
  var seneca = await seneca_instance()

  var msgtest = SenecaMsgTest(seneca, require('./test-msgs.js'))
  await msgtest()
})

function seneca_instance(config, plugin_options) {
  return Seneca(config, { legacy: false })
    .test()
    .use('promisify')
    .use('entity')
    .use(Plugin, plugin_options)
}
