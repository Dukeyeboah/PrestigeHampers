import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { checkoutSchema, priceOrder, assertPaidTransaction } from '../lib/paystack/validation';
import { validWebhookSignature } from '../lib/paystack/signature';
import { buildHamperCatalog } from '../lib/hamper-catalog';

const gift = { buyerName: 'Preview Test', buyerEmail: 'test@example.com', buyerPhone: '0245667892', buyerCountry: 'GH', buyerPhoneKind: 'whatsapp', deliveryOption: 'pickup', region: '', area: '', address: '', date: '' };
const input = { attemptId: 'b5ce1683-0e59-4291-a117-d30878ba300b', gift, items: [{id:'hamper-family-breakfast',quantity:2}], expectedAmount:200000,notes:'' };
test('requires valid contact details and normalizes Ghana numbers', () => {
  assert.equal(checkoutSchema.parse(input).gift.buyerPhone, '+233245667892');
  for (const patch of [{buyerEmail:''},{buyerEmail:'wrong'},{buyerPhone:'123'},{buyerName:' '},{deliveryOption:'delivery'}]) assert.equal(checkoutSchema.safeParse({...input,gift:{...gift,...patch}}).success,false);
});
test('server catalog controls price; rejects hidden, unknown, duplicate and invalid quantities', () => {
  assert.equal(priceOrder(input.items,buildHamperCatalog()).amount,200000);
  for(const items of [[{id:'missing',quantity:1}],[{id:'hamper-family-breakfast',quantity:-1}],[{id:'hamper-family-breakfast',quantity:1.5}],[{id:'hamper-family-breakfast',quantity:100}], [...input.items,...input.items]]) assert.throws(()=>priceOrder(items,buildHamperCatalog()));
  assert.throws(()=>priceOrder(input.items,buildHamperCatalog().map(p=>({...p,isHidden:true}))));
});
test('payment verification rejects wrong amount, currency, reference, mode or pending status', () => {
  const data={reference:'PH-TEST-example',status:'success',amount:200000,currency:'GHS',domain:'test'};
  assert.doesNotThrow(()=>assertPaidTransaction(data,{reference:data.reference,amount:200000}));
  for (const patch of [{amount:1},{currency:'NGN'},{reference:'another'},{domain:'live'},{status:'pending'}]) assert.throws(()=>assertPaidTransaction({...data,...patch},{reference:data.reference,amount:200000}));
});
test('legacy webhook requires exact signed raw bytes and rejects forged signatures', () => {
  const body=Buffer.from('{"event":"charge.success"}');const secret='sk_test_example';
  const signature=createHmac('sha512',secret).update(body).digest('hex');
  assert.equal(validWebhookSignature(body,new Headers({'x-paystack-signature':signature}),secret),true);
  assert.equal(validWebhookSignature(Buffer.from('{}'),new Headers({'x-paystack-signature':signature}),secret),false);
  assert.equal(validWebhookSignature(body,new Headers({'x-paystack-signature':'short'}),secret),false);
  assert.equal(validWebhookSignature(body,new Headers(),secret),false);
});
test('modern webhook enforces timestamp, signature and supports rotation', () => {
  const body=Buffer.from('{}');const secret='whsec_test';const now=1800000000;
  const signature=createHmac('sha512',secret).update(`${now}.`).update(body).digest('hex');
  const headers=new Headers({'paystack-signature':`t=${now},v1=whk_old:bad,v1=whk_new:${signature}`});
  assert.equal(validWebhookSignature(body,headers,'sk_test_x',secret,now),true);
  assert.equal(validWebhookSignature(body,headers,'sk_test_x',secret,now+301),false);
  assert.equal(validWebhookSignature(Buffer.from('{ }'),headers,'sk_test_x',secret,now),false);
});
