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
            data$: (_d) => { },
            save$: async () => ({}),
        },
        out$: {
            ok: false,
            item: {},
        },
    };
    work.ent_ver = await seneca.entity('sys/entver').load$(work.entverq);
    if (work.ent_ver) {
        work.out$.item = await seneca
            // TODO: seneca-entity should support canon object here
            .entity(msg.ent.base + '/' + msg.ent.name)
            .load$(work.entverq.ent_id);
        work.out$.item = await work.out$.item
            .data$(work.ent_ver.d)
            .data$({
            custom$: {
                res_ver_id: work.ent_ver.id
            }
        })
            .save$();
    }
    work.out$.ok = null != work.out$.item;
    return work.out$;
}
exports.entity_restore_msg = entity_restore_msg;
//# sourceMappingURL=entity_restore_msg.js.map