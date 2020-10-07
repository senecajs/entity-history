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
    seneca.message('foo:bar', foobar);
    function foobar() {
        return __awaiter(this, void 0, void 0, function* () {
            return {};
        });
    }
    return {
        name: 'entity-history',
    };
}
const intern = (module.exports.intern = {});
//# sourceMappingURL=entity-history.js.map