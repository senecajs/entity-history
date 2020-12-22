/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.entity_restore_msg = void 0;
/* $lab:coverage:on$ */
async function entity_restore_msg(msg) {
    let seneca = this;
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
            data$: (d) => { },
            save$: async () => ({}),
        },
        out$: {
            ok: false,
            item: {},
        },
    };
    // console.log(work.entverq)
    work.ent_ver = await seneca.entity('sys/entver').load$(work.entverq);
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
            .save$();
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
    work.out$.ok = null != work.out$.item;
    return work.out$;
}
exports.entity_restore_msg = entity_restore_msg;
//# sourceMappingURL=entity_restore_msg.js.map