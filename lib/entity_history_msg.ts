/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict'

import intern from './intern'

/* $lab:coverage:on$ */


export async function entity_history_msg(msg: {
  ent: {
    id: string
    base: string
    name: string
    canon$: any
  }

  size: number // number of history entries to load, ignored if diff
  data: boolean // include version data

  // if defined
  diff: {
    ver_id: string // diff fields from this version, else from start
    ents: boolean // include history entries
  }

}) {
  let seneca = this

  let size = msg.size || 111
  let diff = msg.diff || undefined

  if (diff) {
    diff.ents = !!diff.ents
  }

  // shortcut for repl use
  let entq = {
    id: msg.ent.id,
    base: msg.ent.base,
    name: msg.ent.name,
  }

  if (msg.ent.canon$) {
    let canon = msg.ent.canon$({ object: true })
    entq.base = canon.base
    entq.name = canon.name
  }


  // don't load data field `d` unless requested
  let fields = intern.entver_fields.concat(msg.data ? ['d'] : [])

  let work = {
    histq: {
      ent_id: entq.id,
      base: entq.base,
      name: entq.name,
      when: undefined as any,
      is_finder: false,
      sort$: { when: -1 },
      limit$: (size as number | undefined),
      fields$: fields,
    },
    diff_ent: undefined,
    out: {
      ok: false,
      items: [],
      changed: ([] as any[]),
      fields: ([] as any[]),
    },
  }

  if (diff && diff.ver_id) {

    work.diff_ent = await seneca.entity('sys/entver').load$({
      id: diff.ver_id,
      fields$: intern.entver_fields, // don't load data field `d`
    })

    if (null == work.diff_ent) {
      seneca.fail('diff-entity-not-found')
    }
    else {
      work.histq.limit$ = undefined
      work.histq.when = { $gte: (work.diff_ent as any).when }
    }
  }
  else {
    delete work.histq.when
  }

  work.out.items = await seneca.entity('sys/entver').list$(work.histq)

  if (diff) {
    // union of changed fields
    work.out.changed = [
      ...new Set(
        work.out.items
          .reduce((c: any[], item: any) =>
            (c.push(...item.changed), c), [])
      )
    ]

    // union of all fields
    work.out.fields = [
      ...new Set(
        work.out.items
          .reduce((c: any[], item: any) =>
            (c.push(...item.fields), c), [])
      )
    ]
  }

  work.out.ok = null != work.out.items

  return work.out
}


/*

# sys:enthist

## enthist:list
msg$:
ent:
id: string
base: string
name: string
size: 111
histq:
ent_id: msg$.ent.id
base: msg$.ent.base
name: msg$.ent.name
sort$: when: -1
limit$: msg$.size
out$:
ok => null != items  // lazy
items: []

// above are just insert operations on tree

// operations on the tree are TFS unifications! (on subtrees)

// all equiv
out$.items: load$ sys/enthist histq
out$:
items: load$ sys/enthist histq
out$: items: load$ sys/enthist histq


// shortcut for
out$.items: sys:entity,cmd:list,base:sys,name:enthist,q:.histq

  */
