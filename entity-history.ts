/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict'

/* $lab:coverage:on$ */

import Doc from './entity-history-doc'

module.exports = entity_history
module.exports.defaults = {
}
module.exports.errors = {}
module.exports.doc = Doc


function entity_history(options: any) {
  const seneca = this

  seneca.message('foo:bar', foobar)

  async function foobar() {
    return {}
  }

  return {
    name: 'entity-history',
  }
}

const intern = (module.exports.intern = {
})
