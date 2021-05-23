/* Copyright (c) 2020 voxgig and other contributors, MIT License */
/* $lab:coverage:off$ */
'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.make_cmd_save_history_msg = void 0;
const intern_1 = __importDefault(require("./intern"));
/* $lab:coverage:on$ */
// TODO: this should not be necessary
// https://github.com/senecajs/seneca/issues/873
function make_cmd_save_history_msg(options) {
    return async function cmd_save_history(msg, meta) {
        let seneca = this;
        let entity$ = msg.ent.entity$ = (msg.ent.entity$ || intern_1.default.canon(msg));
        // Avoid infinite loops
        if (entity$.endsWith('sys/entver')) {
            return this.prior(msg, meta);
        }
        let ent = seneca.entity(msg.ent);
        // TODO seneca-entity should return null, thus removing need for ?:
        // let entprev = null == ent.id ? null : await ent.load$(ent.id)
        let entprev = await ent.load$(ent.id);
        let entout = await this.prior(msg, meta);
        let changed = []; // changed fields
        if (entprev) {
            let od = entout.data$(false);
            let pd = entprev.data$(false);
            let allkeysuniq = [...new Set([...Object.keys(od), ...Object.keys(pd)])]
                // Do not include resver_id in changed fields as this would be spurious
                .filter((k) => k != 'resver_id');
            allkeysuniq.forEach((fn) => {
                let ov = od[fn];
                let pv = pd[fn];
                let ot = typeof ov;
                let pt = typeof pv;
                if (null != ov || null != pv) {
                    if ('object' === ot && 'object' === pt) {
                        changed.push(fn); // TODO: proper object data equiv test
                    }
                    else if (ov !== pv) {
                        changed.push(fn);
                    }
                }
            });
        }
        let who = null == options.build_who
            ? {}
            : options.build_who.call(this, entprev, changed, entout, ...arguments);
        let what = null == options.build_who
            ? {}
            : options.build_what.call(this, entprev, changed, entout, ...arguments);
        let histspec = {
            seneca,
            entmsg: msg.ent,
            entout,
            entprev,
            changed,
            who,
            what,
        };
        let wait = options.wait ||
            (ent.history$ && ent.history$.wait) ||
            (ent.custom$ && ent.custom$.history && ent.custom$.history.wait);
        // don't wait for version handling to complete, unless options.wait
        if (wait) {
            await intern_1.default.history(histspec);
        }
        else {
            intern_1.default.history(histspec);
        }
        return entout;
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
          // http://synapticfailure.com/ai/lisp_js/
          // http://www.joeganley.com/code/jslisp.html
          // https://calormen.com/jisp/
          */
    };
}
exports.make_cmd_save_history_msg = make_cmd_save_history_msg;
//# sourceMappingURL=make_cmd_save_history_msg.js.map