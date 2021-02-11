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
  var seneca = seneca_instance(null, {
    // Apply history to these ents.
    ents: ['base:zed'],

    // built-ins to create version entry fields
    build_who: (prev, fields, ent, msg, meta) => ({
      name: meta.custom.name,
    }),
    build_what: (prev, fields, ent, msg, meta) => ({
      title: ent.x,
    }),
  })

  await seneca.ready()

  // Save a new entity.

  let b01 = await seneca
    .entity('zed/bar', { id$: 'b01', x: 1, y: 'Y1', rtag: 'r01' })
    .save$()

  // History saving is parallel, so wait for it to complete.

  await seneca.ready()

  // Entity history stored in sys/entver.

  let hl0 = await seneca.post('sys:entity,rig:history,entity:history', {
    ent: b01,
  })
  expect(hl0.ok).true
  expect(hl0.items.length).equal(1)
  expect(hl0.items[0]).includes({
    ent_id: b01.id,
    base: 'zed',
    name: 'bar',
    fields: ['x', 'y', 'rtag', 'id'],
    changed: [],
    ent_rtag: 'r01',
    prev_rtag: '',
    who: { name: 'alice' },
    what: { title: 1 },
  })

  // Make a change.

  b01.x = 2
  b01.rtag = 'r02'
  await b01.save$()

  await seneca.ready()
  let hl1 = await seneca.post('sys:entity,rig:history,entity:history', {
    ent: b01,
  })

  // History now includes changes.

  expect(hl1.ok).true
  expect(hl1.items.length).equal(2)
  expect(hl1.items[0].when).above(hl1.items[1].when) // reverse time order
  expect(hl1.items[0]).includes({
    ent_id: b01.id,
    base: 'zed',
    name: 'bar',
    fields: ['x', 'y', 'rtag', 'id'],
    changed: ['x', 'rtag'],
    prev_rtag: 'r01',
    ent_rtag: 'r02',
  })
  expect(hl1.items[1]).includes({
    ent_id: b01.id,
    base: 'zed',
    name: 'bar',
    fields: ['x', 'y', 'rtag', 'id'],
    changed: [],
    ent_rtag: 'r01',
    prev_rtag: '',
  })

  let v0 = hl1.items[1]

  // Restore the initial version.

  let res0 = await seneca.post('sys:entity,rig:history,entity:restore', {
    ent: {
      ent_id: v0.ent_id,
      ver_id: v0.id,
      base: 'zed',
      name: 'bar',
    },
  })

  expect(res0.ok).true()
  expect(res0.item).includes({
    x: 1,
    y: 'Y1',
    rtag: 'r01',
  })

  // Load normally to verify we're back to initial version.

  let b01r = await seneca.entity('zed/bar').load$(b01.id)
  expect(b01r).includes({ x: 1, y: 'Y1', rtag: 'r01' })

  // History now contains a new entry (by design).

  await seneca.ready()
  let hl2 = await seneca.post('sys:entity,rig:history,entity:history', {
    ent: b01,
    data: true,
  })
  expect(hl2.items.length).equal(3)
  expect(hl2.items[0]).includes({
    ent_rtag: 'r01',
    prev_rtag: 'r02',
    fields: ['x', 'y', 'rtag', 'id'],
    changed: ['x', 'rtag'],
    base: 'zed',
    name: 'bar',
    is_restore: true,
  })
})

lab.test('messages', async () => {
  var seneca = await seneca_instance(null, {
    wait: true,
    ents: ['base:zed'],
  })

  var msgtest = SenecaMsgTest(seneca, require('./test-msgs.js'))
  await msgtest()
})

function seneca_instance(config, plugin_options) {
  return (
    Seneca(config, { legacy: false })
      .test()
      .use('promisify')
      .use('entity')

      // uncomment to test against a local mongo db
      // NOTE: clear manually after each run
      // .use('mongo-store', { host: 'localhost', name: 'seneca_enthist_test' })

      .use(Plugin, plugin_options)
      .delegate(null, { custom: { name: 'alice' } })
  )
}
