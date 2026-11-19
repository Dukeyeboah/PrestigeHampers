import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { buildWhatsAppOrderMessage, whatsappOrderLaunchUrl } from '../lib/whatsapp-order';
const items = [{id:'hamper-family-breakfast',name:'Family Breakfast',category:'Hampers',price:1000,quantity:2,stock:99,unit:'hamper',updatedAt:0}];
test('guest WhatsApp order includes contact, quantities, payment, notes and total', () => {
 const message=buildWhatsAppOrderMessage({items,total:2000,customerName:'Test Guest',contactPhone:'0240000000',paymentMethod:'momo',notes:'Gift & delivery'});
 assert.match(message,/Ordered by:\* Test Guest/);
 assert.match(message,/Contact phone:\* 0240000000/);
 assert.match(message,/Quantity: 2/);
 assert.match(message,/Subtotal: ₵2,000.00/);
 assert.match(message,/Grand total: ₵2,000.00/);
 assert.match(message,/Payment:\* MoMo/);
 assert.match(message,/Gift & delivery/);
 const url=new URL(whatsappOrderLaunchUrl(message));
 assert.equal(url.hostname,'wa.me');
 assert.equal(url.pathname,'/14844674166');
 assert.equal(url.searchParams.get('text'),message);
});
test('account orders retain their reference and account details', () => {
 const message=buildWhatsAppOrderMessage({items,total:2000,user:{id:'test',email:'test@example.com',name:'Test Customer',role:'client',createdAt:0},displayOrderId:'TEST1234'});
 assert.match(message,/TEST1234/);assert.match(message,/test@example.com/);
});
