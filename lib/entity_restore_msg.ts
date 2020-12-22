/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict'

/* $lab:coverage:on$ */


export async function entity_restore_msg(msg: {
  ent: {
    id?: string
    ent_id?: string
    ver_id: string
    base: string
    name: string
  }
}) {
  let seneca = this

  let work = {
    entverq: {
      ent_id: msg.ent.ent_id || msg.ent.id,
      id: msg.ent.ver_id,
      base: msg.ent.base,
      name: msg.ent.name,
    },
    ent_ver: {
      d: null,
      id: null,
    },
    res_ent: {
      resver_id: '',
      data$: (d: any) => { },
      save$: async () => ({}),
    },
    out$: {
      ok: false,
      item: {},
    },
  }

  // console.log(work.entverq)
  work.ent_ver = await seneca.entity('sys/entver').load$(work.entverq)

  // console.log('ent_ver', work.entverq, work.ent_ver)

  if (work.ent_ver) {
    work.out$.item = await seneca

      // TODO: seneca-entity should support canon object here
      .entity(msg.ent.base + '/' + msg.ent.name)
      //.load$(work.entverq.ent_id)
      .data$(work.ent_ver.d)
      .data$({
        custom$: {
          res_ver_id: work.ent_ver.id
        }
      })
      .save$()

    // console.log('item', work.out$.item)

    /*
    if (work.res_ent) {
      work.res_ent.data$(work.ent_ver.d)

      work.res_ent.resver_id = msg.ent.ver_id
      work.out$.item = await work.res_ent.save$()

      console.log('res_ent saved', work.out$.item)
    }
    */
  }

  work.out$.ok = null != work.out$.item

  return work.out$

}


/*
let $ = seneca.proc()
$`
  ent = msg.ent
  entver = load$ sys/entver {
    ent_id: ent.ent_id || ent.id
    id: ent.ver_id,
    base: ent.base,
    name: ent.name,
  }
  meta$ custom { restore_id: entver.id }
  out.item = save$ canon$ ent entver.d
  out.ok = out.item?
`
*/



/*

# entity:restore

// maybe just use msg, out, and reserve suffix $ for built in functions?
msg$:
ent:
ent_id: string
ver_id: string
base: string
name: string,

entverq:
ent_id: msg$.ent.ent_id
id: msg$.ent.ver_id
base: msg$.ent.base
name: msg$.ent.name

ent_ver: load$ sys/entvar entverq

if$ ent_ver
res_ent: load$ (+ msg.ent.base '/' msg.ent.name) msg.ent.ent_id

if$ res_ent
data$ res_ent work.ent_ver.d  // implicit throwaway
res_ent.resver_id: msg.ent.ver_id
out$.item: save$ res_ent

// OR
out$.item:
save$
data$
  load$ (+ msg.ent.base '/' msg.ent.name) msg.ent.ent_id
  & {resver_id:msg.ent.ver_id} (.d load$ sys/entvar entverq) // & is unify
  // FIX load$ sys/entvar entverq may be null, then nothing should happen
  // nil should propogate upwards stopping everything
  // BUT how to handle ignorable empty vals?
  // nil === data$ foo nil
  // MAYBE: {} | .d load$ sys/entvar entverq
  //  as X | nil === X ???
  // is nil bottom? don't think so as not an error

out$.ok = null != out$.item

*/

