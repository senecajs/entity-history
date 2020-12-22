/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.entity_load_msg = void 0;
/* $lab:coverage:on$ */
async function entity_load_msg(msg) {
    let seneca = this;
    // shortcut for repl use
    /*
      ent = msg.ent
      out.entver = delete$ d load$ sys/entver {
        ent_id: ent.ent_id ?? ent.id,
        id: ent.ver_id ?? ent.ent_id ?? ent.id,
        base: ent.base,
        name: ent.name,
      }
      out.item = entity$ canon$ ent out.entver.d
      out.ok = out.item?
  */
    let work = {
        entverq: {
            ent_id: msg.ent.ent_id || msg.ent.id,
            // load current if version not specified
            id: msg.ent.ver_id || msg.ent.ent_id || msg.ent.id,
            base: msg.ent.base,
            name: msg.ent.name,
        },
        ent_ver: {
            d: null,
        },
        out$: {
            ok: false,
            item: null,
            entver: null
        },
    };
    // console.log('EH LOAD work init', work)
    //console.log('ENTVERQ', work.entverq)
    work.ent_ver = await seneca.entity('sys/entver').load$(work.entverq);
    // console.log('ent_ver', work.ent_ver)
    if (work.ent_ver) {
        work.out$.item = seneca
            .entity(work.entverq.base + '/' + work.entverq.name)
            .data$(work.ent_ver.d);
        work.out$.entver = work.ent_ver;
        delete work.out$.entver.d;
    }
    work.out$.ok = null != work.out$.item;
    return work.out$;
}
exports.entity_load_msg = entity_load_msg;
//# sourceMappingURL=entity_load_msg.js.map