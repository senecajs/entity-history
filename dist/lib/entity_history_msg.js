/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.entity_history_msg = void 0;
const intern_1 = __importDefault(require("./intern"));
/* $lab:coverage:on$ */
async function entity_history_msg(msg) {
    let seneca = this;
    let size = msg.size || 111;
    let diff = msg.diff || undefined;
    if (diff) {
        diff.ents = !!diff.ents;
    }
    // shortcut for repl use
    let entq = {
        id: msg.ent.id,
        base: msg.ent.base,
        name: msg.ent.name,
    };
    if (msg.ent.canon$) {
        let canon = msg.ent.canon$({ object: true });
        entq.base = canon.base;
        entq.name = canon.name;
    }
    // don't load data field `d` unless requested
    let fields = intern_1.default.entver_fields.concat(msg.data ? ['d'] : []);
    let work = {
        histq: {
            ent_id: entq.id,
            base: entq.base,
            name: entq.name,
            when: undefined,
            is_finder: false,
            sort$: { when: -1 },
            limit$: size,
            fields$: fields,
        },
        diff_ent: undefined,
        out: {
            ok: false,
            items: [],
            changed: [],
            fields: [],
        },
    };
    if (diff && diff.ver_id) {
        work.diff_ent = await seneca.entity('sys/entver').load$({
            id: diff.ver_id,
            fields$: intern_1.default.entver_fields,
        });
        if (null == work.diff_ent) {
            seneca.fail('diff-entity-not-found');
        }
        else {
            work.histq.limit$ = undefined;
            work.histq.when = { $gte: work.diff_ent.when };
        }
    }
    else {
        delete work.histq.when;
    }
    work.out.items = await seneca.entity('sys/entver').list$(work.histq);
    if (diff) {
        // union of changed fields
        work.out.changed = [
            ...new Set(work.out.items
                .reduce((c, item) => (c.push(...item.changed), c), []))
        ];
        // union of all fields
        work.out.fields = [
            ...new Set(work.out.items
                .reduce((c, item) => (c.push(...item.fields), c), []))
        ];
    }
    work.out.ok = null != work.out.items;
    return work.out;
}
exports.entity_history_msg = entity_history_msg;
//# sourceMappingURL=entity_history_msg.js.map