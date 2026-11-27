import test from 'node:test';
import assert from 'node:assert/strict';
import { confirmPayment } from '../lib/paystack/finalize';
// Minimal transactional store: serializes competing webhook/browser confirmations.
function fixture(status='success', amount=95000) {
 const reference='PH-TEST-3f17b5cf-0d72-49ec-83c2-b8e95d50a3ef';
 const data=new Map<string,any>([[`paystack_test_checkouts/${reference}`,{reference,amount:95000,items:[{name:'Budget',quantity:1,price:950}],gift:{buyerName:'Test',buyerEmail:'test@example.com',buyerPhone:'+233245667892',deliveryOption:'pickup'},userId:null,notes:'',createdAt:1,paymentStatus:'pending'}]]);
 let queue=Promise.resolve();let creates=0;
 const doc=(key:string)=>({key,get:async()=>({exists:data.has(key),data:()=>data.get(key)})});
 const db={collection:(name:string)=>({doc:(id:string)=>doc(`${name}/${id}`)}),runTransaction:(fn:any)=>{const next=queue.then(()=>fn({get:(r:any)=>r.get(),update:(r:any,value:any)=>data.set(r.key,{...data.get(r.key),...value}),create:(r:any,value:any)=>{assert.equal(data.has(r.key),false);creates++;data.set(r.key,value);}}));queue=next.catch(()=>{});return next;}};
 return {reference,data,creates:()=>creates,dependencies:{db:db as any,verify:async()=>({reference,status,amount,currency:'GHS',domain:'test',channel:'card',paid_at:'2026-11-27T12:00:00Z'})}};
}
test('concurrent webhook and return-page confirmations create exactly one guest order',async()=>{
 const f=fixture();await Promise.all([confirmPayment(f.reference,f.dependencies),confirmPayment(f.reference,f.dependencies)]);
 await confirmPayment(f.reference,f.dependencies);
 assert.equal(f.creates(),1);const order=f.data.get(`paystack_test_orders/${f.reference}`);
 assert.equal(order.paymentStatus,'paid');assert.equal(order.isGuest,true);assert.equal(order.total,950);
 assert.equal(f.data.has(`orders/${f.reference}`),false);
});
test('pending and failed payments never create an order',async()=>{
 for(const status of ['pending','failed','abandoned']){const f=fixture(status);const result=await confirmPayment(f.reference,f.dependencies);assert.notEqual(result?.paymentStatus,'paid');assert.equal(f.creates(),0);}
});
test('underpaid success does not create an order or mark the checkout paid',async()=>{
 const f=fixture('success',1);await assert.rejects(confirmPayment(f.reference,f.dependencies));assert.equal(f.creates(),0);assert.equal(f.data.get(`paystack_test_checkouts/${f.reference}`).paymentStatus,'pending');
});
