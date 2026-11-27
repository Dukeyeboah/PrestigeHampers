import { z } from 'zod';
export const fulfilmentStatuses = ['new', 'preparing', 'ready_for_pickup', 'out_for_delivery', 'fulfilled', 'cancelled'] as const;
export type FulfilmentStatus = typeof fulfilmentStatuses[number];
export const statusLabels: Record<FulfilmentStatus, string> = {new:'New',preparing:'Preparing',ready_for_pickup:'Ready for pickup',out_for_delivery:'Out for delivery',fulfilled:'Fulfilled',cancelled:'Cancelled'};
export const updateOrderSchema = z.object({id:z.string().regex(/^PH-TEST-[0-9a-f-]{36}$/),status:z.enum(fulfilmentStatuses),note:z.string().trim().min(1,'Add a short note explaining this update.').max(1000),version:z.number().int().nonnegative()}).strict();
export function currentStatus(order: {fulfilmentStatus?: string}): FulfilmentStatus { return fulfilmentStatuses.includes(order.fulfilmentStatus as FulfilmentStatus) ? order.fulfilmentStatus as FulfilmentStatus : 'new'; }
export function validateUpdate(order: {paymentStatus?:string;testMode?:boolean;deliveryOption?:string;managementVersion?:number}, input:z.infer<typeof updateOrderSchema>) {
 if(order.testMode!==true || order.paymentStatus!=='paid') throw new Error('Only verified paid test orders can be managed here.');
 if((order.managementVersion||0)!==input.version) throw new Error('This order was updated by another admin. Refresh it before saving.');
 if(input.status==='ready_for_pickup' && order.deliveryOption!=='pickup') throw new Error('This order is for delivery, not pickup.');
 if(input.status==='out_for_delivery' && order.deliveryOption!=='delivery') throw new Error('This order is for pickup, not delivery.');
}
export function adminAllowed(identity:{email?:string;email_verified?:boolean}|null, profile?:{role?:string}) {
 return Boolean(identity?.email_verified && identity.email && profile?.role==='admin');
}
