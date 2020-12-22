/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/* $lab:coverage:on$ */
const intern = {
    // NOTE: excludes data field `d`
    entver_fields: [
        'ent_id',
        'ent_rtag',
        'prev_rtag',
        'prev_ver_id',
        'c_version',
        'res_ver_id',
        'fields',
        'changed',
        'base',
        'name',
        'when',
        'who',
        'what',
        'is_finder',
        'is_restore',
    ],
    // TODO: should be an entity util
    canon(msg) {
        return (null == msg.zone ? '-' : msg.zone) + '/' +
            (null == msg.base ? '-' : msg.base) + '/' +
            (null == msg.name ? '-' : msg.name);
    },
    // sys/entver - entity versions, including data
    // sys/enthist - entity version metadata, excluding data
    async history(histspec) {
        let seneca = histspec.seneca;
        let entmsg = histspec.entmsg;
        let entout = histspec.entout;
        let entprev = histspec.entprev;
        let changed = histspec.changed;
        let who = histspec.who;
        let what = histspec.what;
        let canon = entout.canon$({ object: true });
        // also indexed by entity id for fast lookup of current version
        let finder = await seneca
            .entity('sys/entver')
            .load$(entout.id);
        let data = entout.data$(false);
        let entver = await seneca
            .entity('sys/entver')
            .data$({
            ent_id: entout.id,
            ent_rtag: entout.rtag,
            prev_rtag: entprev ? entprev.rtag : '',
            prev_ver_id: finder ? finder.ver_id : '',
            c_version: finder ? 1 + finder.c_version : 0,
            res_ver_id: entmsg.custom$ ? entmsg.custom$.res_ver_id : undefined,
            fields: Object.keys(data),
            changed: changed,
            base: canon.base,
            name: canon.name,
            when: Date.now(),
            who,
            what,
            is_finder: false,
            is_restore: !!(entmsg.custom$ && entmsg.custom$.res_ver_id),
            d: data
        })
            .save$();
        if (finder) {
            finder = finder.data$(entver);
            finder.id = entver.ent_id;
        }
        else {
            finder = entver.clone$();
            delete finder.id;
            finder.id$ = entver.ent_id;
        }
        finder.ver_id = entver.id;
        finder.is_finder = true;
        await finder.save$();
    }
};
exports.default = intern;
//# sourceMappingURL=intern.js.map