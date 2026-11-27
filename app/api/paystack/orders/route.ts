import { NextResponse } from 'next/server';
import { orderDb, ORDERS, testSecret, jsonError } from '@/lib/paystack/server';
import { orderAdmin } from '@/lib/paystack/admin';
import { currentStatus, updateOrderSchema, validateUpdate } from '@/lib/paystack/order-management';
export const runtime = 'nodejs';
const headers={'Cache-Control':'no-store'};
const forbidden=()=>NextResponse.json({error:'Sign in with an authorised test order administrator account.'},{status:403,headers});
export async function GET(request:Request) {
 try {
  testSecret(); if(!await orderAdmin(request))return forbidden();
  const params=new URL(request.url).searchParams; const id=params.get('id'); const db=orderDb();
  if(id){
   if(!/^PH-TEST-[0-9a-f-]{36}$/.test(id))return NextResponse.json({error:'Invalid order reference.'},{status:400,headers});
   const ref=db.collection(ORDERS).doc(id);const doc=await ref.get();
   if(!doc.exists)return NextResponse.json({error:'Order not found.'},{status:404,headers});
   const history=await ref.collection('history').orderBy('createdAt','desc').limit(100).get();
   return NextResponse.json({order:{...doc.data(),id:doc.id},history:history.docs.map(d=>({id:d.id,...d.data()}))},{headers});
  }
  let query=db.collection(ORDERS).orderBy('createdAt','desc').limit(51);
  const cursor=params.get('cursor');
  if(cursor){
   if(!/^PH-TEST-[0-9a-f-]{36}$/.test(cursor))return NextResponse.json({error:'Invalid page.'},{status:400,headers});
   const last=await db.collection(ORDERS).doc(cursor).get();
   if(!last.exists)return NextResponse.json({error:'Page no longer available. Refresh orders.'},{status:400,headers});
   query=query.startAfter(last);
  }
  const snapshot=await query.get();const docs=snapshot.docs.slice(0,50);
  return NextResponse.json({orders:docs.map(d=>({...d.data(),id:d.id})),nextCursor:snapshot.size>50?docs[49].id:null,emailConfigured:Boolean(process.env.RESEND_API_KEY&&process.env.ORDER_NOTIFICATION_FROM)},{headers});
 }catch(error){return jsonError(error);}
}
export async function PATCH(request:Request) {
 try {
  testSecret();const admin=await orderAdmin(request);if(!admin)return forbidden();
  const raw=await request.text();if(raw.length>6000)return NextResponse.json({error:'Update is too large.'},{status:413,headers});
  let input: ReturnType<typeof updateOrderSchema.parse>;try{input=updateOrderSchema.parse(JSON.parse(raw));}catch{return NextResponse.json({error:'Choose a valid status and include a note (up to 1,000 characters).'},{status:400,headers});}
  const db=orderDb();const ref=db.collection(ORDERS).doc(input.id);
  try{
   await db.runTransaction(async tx=>{
    const doc=await tx.get(ref);if(!doc.exists)throw new Error('Order not found.');const order=doc.data()!;
    validateUpdate(order,input);const createdAt=Date.now();const version=input.version+1;
    tx.update(ref,{fulfilmentStatus:input.status,managementVersion:version,managedAt:createdAt,managedBy:admin.email});
    tx.create(ref.collection('history').doc(String(version).padStart(10,'0')),{from:currentStatus(order),to:input.status,note:input.note,actorUid:admin.uid,actorEmail:admin.email,createdAt,version});
   });
  }catch(error){if(error instanceof Error && ['Only verified paid test orders can be managed here.','This order was updated by another admin. Refresh it before saving.','This order is for delivery, not pickup.','This order is for pickup, not delivery.','Order not found.'].includes(error.message))return NextResponse.json({error:error.message},{status:409,headers});throw error;}
  return NextResponse.json({saved:true},{headers});
 }catch(error){return jsonError(error);}
}
