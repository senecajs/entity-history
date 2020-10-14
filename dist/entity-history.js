/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* $lab:coverage:on$ */
const entity_history_doc_1 = __importDefault(require("./entity-history-doc"));
module.exports = entity_history;
module.exports.defaults = {};
module.exports.errors = {};
module.exports.doc = entity_history_doc_1.default;
function entity_history(options) {
    const seneca = this;
    seneca
        // TODO: not global - parameterise!!!
        .message('role:entity,cmd:save', cmd_save_history)
        .fix('sys:enthist')
        .message('enthist:list', history_list);
    function cmd_save_history(msg, meta) {
        return __awaiter(this, void 0, void 0, function* () {
            let seneca = this;
            let entity$ = msg.ent.entity$;
            // Avoid infinite loops
            if (entity$.endsWith('sys/enthist') ||
                entity$.endsWith('sys/entver')) {
                return this.prior(msg, meta);
            }
            let ent = seneca.entity(msg.ent);
            console.log('ENT', entity$, ent);
            // TODO seneca-entity should return null, thus removing need for ?:
            let prev = null == ent.id ? null : yield ent.load$(ent.id);
            console.log('PREV', ent.id, prev);
            let out = yield this.prior(msg, meta);
            let canon = out.canon$({ object: true });
            let fields = []; // changed fields
            if (prev) {
                let od = out.data$(false);
                let pd = prev.data$(false);
                let allkeysuniq = [...new Set([...Object.keys(od), ...Object.keys(pd)])];
                console.log('ALLK', allkeysuniq);
                allkeysuniq.forEach(fn => {
                    let ov = od[fn];
                    let pv = pd[fn];
                    let ot = typeof (ov);
                    let pt = typeof (pv);
                    console.log('F', fn, ov, pv, ot, pt);
                    if (null != ov || null != pv) {
                        if ('object' === ot && 'object' === pt) {
                            fields.push(fn); // TODO: proper object data equiv test
                        }
                        else if (ov !== pv) {
                            fields.push(fn);
                        }
                    }
                });
            }
            // don't wait for version handling to complete
            seneca.entity('sys/entver').data$({
                ent_id: out.id,
                prev_rtag: prev ? prev.rtag : null,
                fields: fields,
                base: canon.base,
                name: canon.name,
                when: Date.now(),
                d: out.data$(false)
            }).save$(function (err, entver) {
                if (err)
                    return err;
                if (entver) {
                    this.entity('sys/enthist').data$({
                        ver_id: entver.id,
                        ent_id: out.id,
                        prev_rtag: entver.rtag ? entver.rtag : null,
                        fields: fields,
                        base: canon.base,
                        name: canon.name,
                        when: entver.when
                    }).save$();
                }
            });
            return out;
            /*
              
          # sys:entity,cmd:save
          
          // msg$ is a special name - will attempt to unify with seneca inbound message
          msg$:
          ent:
            id: null | string
          
          out$: Entity // Entity is a type declatation, external provided
          
          prev: load$ msg$.ent.entity$ msg$.ent.id
          
          // null result will fail as cannot unify with Entity
          out$: prior$
          
          
          // conditionals
          result: if$ expr0 expr1
          
          // throwaway
          : if$ expr0 expr1
          
          // implicit throwaway
          if$ expr0 expr1
          
          // expr0 is truthy: true is non-nil
          
          // expr1 can't have side effects!!!
          // but does get it's own local context with access to top
          // you can only change top level at the top level
          if$ expr0 expr1
          
          
          if$ prev
          // indent is an implicit ()
          
          // equivs, generates: {base:string|null,name:string,}
          canon: /((?<base>\w+)/)?(?<name>\w+)$/ out$.entity$  // apply a regexp
          canon: out$.canon$  // recognize function, call it!
          
          fields: string[]  // types are values! unify!
          
          // get out of jail
          // lazy eval, unify passes if return val unifies
          fields => {
            if (prev) {
              ...js as above, $ is implicit context
            }
          }
          // NOTE: => is lazy, : is not - as you need well-defined order of persistence ops and msg calls
          
          
          field-keys: \ // multi line value, - in names as just valid JSON "field-keys"
            keys$ data$ out$ data$ prev  // keys$ list uniq keys of objects
            // data$ is entity.data$, handles null gracefully
            // (keys$ (data$ out$) (data$ prev)) // eager function calls
            // RHS is LISPish :)
          
          // push$ does not push nils, eq$/3 return /3 or nil (eq$ lhs rhs yesval?true$ noval?nil)
          // eq$ is intelligent and deep - unifies?!
          // prev[field] is nil if prev is nil
          fields: $reduce field-keys [] (changed,field)=>push$ changed eq$ out$[field] prev[field] field
          
          // save$ implicitly async
          entver: save$ sys/entver {
            ent_id: out$.id // RHS also an s-exp
            fields: fields
            base: canon.base
            name: canon.name
            when: now$
            d: data$ out$
          }
          
          // throw away result
          : save$ sys/enthist {
            ver_id: entver.id
            ent_id: out$.id
            fields: fields
            base: canon.base
            name: canon.name
            when: entver.when
          }
          
          // even top level is LISP really
          
          foo: bar
          (set$ 'foo' 'bar')  // where set operates on current context
          (set$ path expr)  // where set operates on current context
          
          // NOTE: set$ performs a unify at path point
          
          // possible engines:
          // https://github.com/maryrosecook/littlelisp/blob/master/littlelisp.js
          // https://jcubic.github.io/lips/
          // https://github.com/mishoo/SLip
          */
        });
    }
    function history_list(msg) {
        return __awaiter(this, void 0, void 0, function* () {
            let seneca = this;
            let entq = {
                id: msg.ent.id,
                base: null,
                name: null,
            };
            if (msg.ent.canon$) {
                let canon = msg.ent.canon$({ object: true });
                entq.base = canon.base;
                entq.name = canon.name;
            }
            let work = {
                histq: {
                    ent_id: entq.id,
                    base: entq.base,
                    name: entq.name,
                    sort$: { when: -1 },
                    limit$: msg.size
                },
                out: {
                    ok: false,
                    items: []
                }
            };
            work.out.items = yield seneca.entity('sys/enthist').list$(work.histq);
            work.out.ok = null != work.out.items;
            return work.out;
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
        });
    }
    return {
        name: 'entity-history',
    };
}
const intern = (module.exports.intern = {});
//# sourceMappingURL=entity-history.js.map