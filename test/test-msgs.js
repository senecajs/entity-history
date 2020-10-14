/* Copyright © 2020 Richard Rodger, MIT License */
'use strict'

const MsgTest = require('seneca-msg-test')
const LN = MsgTest.LN

module.exports = {
  print: false,
  test: true,
  fix: 'sys:enthist',
  allow: {
    missing: true,
  },
  calls: [
    LN({
      // handle upcoming change role:entity->sys:entity
      pattern: 'sys:entity,role:entity,role:entity,base:zed,name:foo,cmd:save',
      params: {
        // TODO: seneca-entity should reify this!!!
        ent: {
          id$: 'f01',
          x: 1,
          y: 'y01',
          entity$: 'zed/foo',
        },
      },
      out: {
        id: 'f01',
        x: 1,
        y: 'y01',
      },
    }),

    // { pattern: 'role:mem-store,cmd:dump' },

    LN({
      pattern: 'sys:enthist,enthist:list',
      params: {
        ent: {
          id: 'f01',
          base: 'zed',
          name: 'foo',
        },
      },
      out: {
        ok: true,
        items: [{ ent_id: 'f01', fields: [], base: 'zed', name: 'foo' }],
      },
    }),

    LN({
      // handle upcoming change role:entity->sys:entity
      pattern: 'sys:entity,role:entity,role:entity,base:zed,name:foo,cmd:save',
      params: {
        // TODO: seneca-entity should reify this!!!
        ent: {
          id: 'f01',
          x: 2,
          y: 'y01',
          entity$: 'zed/foo',
        },
      },
      out: {
        id: 'f01',
        x: 2,
        y: 'y01',
      },
    }),

    // { pattern: 'role:mem-store,cmd:dump' },

    LN({
      pattern: 'sys:enthist,enthist:list',
      params: {
        ent: {
          id: 'f01',
          base: 'zed',
          name: 'foo',
        },
      },
      out: {
        ok: true,
        items: [
          { ent_id: 'f01', fields: ['x'], base: 'zed', name: 'foo' },
          { ent_id: 'f01', fields: [], base: 'zed', name: 'foo' },
        ],
      },
    }),
  ],
}
