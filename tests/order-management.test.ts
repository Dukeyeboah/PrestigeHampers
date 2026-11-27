import test from 'node:test';
import assert from 'node:assert/strict';
import {adminAllowed,currentStatus,updateOrderSchema,validateUpdate} from '../lib/paystack/order-management';
const input={id:'PH-TEST-3f17b5cf-0d72-49ec-83c2-b8e95d50a3ef',status:'preparing' as const,note:'Packed by the test team',version:0};
const order={testMode:true,paymentStatus:'paid',deliveryOption:'pickup',managementVersion:0};
test('management accepts paid test orders and protects concurrent updates',()=>{validateUpdate(order,input);assert.throws(()=>validateUpdate({...order,managementVersion:1},input),/another admin/);assert.throws(()=>validateUpdate({...order,testMode:false},input));assert.throws(()=>validateUpdate({...order,paymentStatus:'pending'},input));assert.equal(currentStatus({}),'new');});
test('updates cannot alter payment, totals or identity and require an audit note',()=>{for(const extra of [{total:1},{paymentStatus:'paid'},{actorEmail:'forged@example.com'}])assert.equal(updateOrderSchema.safeParse({...input,...extra}).success,false);assert.equal(updateOrderSchema.safeParse({...input,note:' '}).success,false);assert.equal(updateOrderSchema.safeParse({...input,status:'refunded'}).success,false);assert.equal(updateOrderSchema.safeParse({...input,version:-1}).success,false);});
test('pickup and delivery status match the order fulfilment method',()=>{assert.throws(()=>validateUpdate(order,{...input,status:'out_for_delivery'}));assert.throws(()=>validateUpdate({...order,deliveryOption:'delivery'},{...input,status:'ready_for_pickup'}));validateUpdate(order,{...input,status:'fulfilled'});validateUpdate(order,{...input,status:'cancelled'});});
test('admin access requires verified identity and current user profile role',()=>{
 const user={email:'admin@example.com',email_verified:true};
 assert.equal(adminAllowed(user,{role:'admin'}),true);
 for(const profile of [undefined,{role:'client'},{role:'staff'},{role:'Admin'},{}])assert.equal(adminAllowed(user,profile),false);
 assert.equal(adminAllowed({...user,email_verified:false},{role:'admin'}),false);
 assert.equal(adminAllowed(null,{role:'admin'}),false);
 assert.equal(adminAllowed({email_verified:true},{role:'admin'}),false);
 // Downgrading the saved role revokes access, regardless of email.
 assert.equal(adminAllowed(user,{role:'client'}),false);
});
