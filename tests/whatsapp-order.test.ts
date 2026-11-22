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
 assert.match(message,/Payment method:\* MoMo/);
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

test('gift checkout carries recipient, requested date and contact method into the WhatsApp draft', async () => {
 const {giftDetailsNotes,emptyGift}=await import('../lib/gift-details');
 const notes=giftDetailsNotes({...emptyGift,recipientName:'Recipient',recipientPhone:'0200000000',area:'Accra',date:'2026-12-20',message:'Happy holidays!',from:'Sender'});
 const message=buildWhatsAppOrderMessage({items,total:2000,customerName:'Buyer',paymentMethod:'momo',notes});
 for(const expected of ['Recipient: Recipient','Recipient phone: 0200000000','Preferred date: 2026-12-20','Recipient phone: 0200000000 (Calls / SMS)']) assert.ok(message.includes(expected));
 assert.ok(!message.includes('Card message:'));
});
