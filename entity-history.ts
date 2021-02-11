/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict'

/* $lab:coverage:on$ */

import Doc from './entity-history-doc'

import { entity_history_msg } from './lib/entity_history_msg'
import { entity_restore_msg } from './lib/entity_restore_msg'
import { entity_load_msg } from './lib/entity_load_msg'
import { make_cmd_save_history_msg } from './lib/make_cmd_save_history_msg'

module.exports = entity_history
module.exports.defaults = {
  ents: [],
  build_who: null, // function to generate who object
  wait: false, // wait for history to save before returning
}
module.exports.errors = {}
module.exports.doc = Doc

function entity_history(options: any) {
  const seneca = this

  // TODO: this should not be necessary
  // plugin definition delegate should provide plugin options directly
  const cmd_save_history_msg = make_cmd_save_history_msg(options)

  for (let canon of options.ents) {
    let ent_save_pat = {
      ...seneca.util.Jsonic(canon),
      ...{ role: 'entity', cmd: 'save' },
    }
    seneca.message(ent_save_pat, cmd_save_history_msg)
  }

  seneca
    .fix('sys:entity,rig:history')
    .message('entity:history', entity_history_msg)
    .message('entity:restore', entity_restore_msg)
    .message('entity:load', entity_load_msg)

  return {
    name: 'entity-history',
  }
}
