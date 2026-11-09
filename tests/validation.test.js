import test from 'node:test';import assert from 'node:assert/strict';import {validateRequest} from '../server/validation.js';
const base={message:'I would like information.',channel:'phone',contact:'+977 9800000000',safeTime:'Weekdays 1–3 pm',consent:true};
test('valid consented request',()=>assert.equal(validateRequest(base),null));
test('rejects absent consent',()=>assert.match(validateRequest({...base,consent:false}),/Consent/));
test('rejects unsupported channels',()=>assert.match(validateRequest({...base,channel:'email'}),/contact method/));
test('rejects invalid contact',()=>assert.match(validateRequest({...base,contact:'<script>'}),/contact number/));
test('rejects oversized messages',()=>assert.match(validateRequest({...base,message:'x'.repeat(2001)}),/2000/));
test('rejects honeypot submissions',()=>assert.equal(validateRequest({...base,website:'spam'}),'Invalid request.'));
