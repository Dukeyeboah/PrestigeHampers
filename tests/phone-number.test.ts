import {strict as assert} from 'node:assert';
import {test} from 'node:test';
import {normalizePhone,GHANA_REGIONS} from '../lib/phone-number';
test('Ghana national and international inputs normalize without duplicate prefixes',()=>{
 for(const input of ['0245667892','245667892','+233245667892','+233 24 566 7892','00233245667892'])assert.equal(normalizePhone(input,'GH','whatsapp'),'+233245667892');
 assert.equal(normalizePhone('0245667892','GH','local'),'+233245667892');
});
test('international numbers use country rules rather than blindly stripping zeroes',()=>{
 assert.equal(normalizePhone('07911 123456','GB'),'+447911123456');
 assert.equal(normalizePhone('06 6982','IT'),'+39066982');
 assert.equal(normalizePhone('+1 484 467 4166','US'),'+14844674166');
});
test('invalid input and foreign numbers in local Ghana mode are rejected',()=>{
 for(const input of ['abc','123','024566789222','call 0245667892','+233245667892 ext 2'])assert.equal(normalizePhone(input,'GH'),null);
 assert.equal(normalizePhone('+14844674166','GH','local'),null);
 assert.equal(new Set(GHANA_REGIONS).size,16);
});
