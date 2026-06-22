/**
 * Helper functions for creating and managing notifications
 */

import { addDoc, getDocs, query, where, collection } from 'firebase/firestore';
import { db } from './firebase';
import type { Notification } from '@/types';

export async function createNotification(
  userId: string,
  type: Notification['type'],
  title: string,
  message: string,
  orderId?: string
): Promise<void> {
  if (!db) {
    console.error('Database not available');
    return;
  }

  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      type,
      title,
      message,
      orderId: orderId || null,
      read: false,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Error creating notification:', error);
  }
}

export async function createAdminNewOrderAlert(
  orderId: string,
  summary: string
): Promise<void> {
  if (!db) return;

  try {
    await addDoc(collection(db, 'admin_alerts'), {
      orderId,
      message: summary,
      read: false,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.error('Error creating admin order alert:', error);
  }
}

export async function notifyAdminsOfNewOrder(
  orderId: string,
  customerLabel: string,
  total: number,
  itemCount: number
): Promise<void> {
  const summary = `New order #${orderId.slice(0, 8)} from ${customerLabel} — ${itemCount} item(s), ₵${total.toFixed(2)}`;
  await createAdminNewOrderAlert(orderId, summary);

  if (!db) return;

  try {
    const adminsSnap = await getDocs(
      query(collection(db, 'users'), where('role', '==', 'admin'))
    );
    await Promise.all(
      adminsSnap.docs.map((adminDoc) =>
        createNotification(
          adminDoc.id,
          'admin_message',
          'New order received',
          summary,
          orderId
        )
      )
    );
  } catch {
    // Guest checkout cannot query users — admin_alerts still notifies via dashboard
  }
}

export async function createOrderStatusNotification(
  userId: string,
  orderId: string,
  status: string,
  orderItems: Array<{ name: string; quantity: number }>
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    shop_confirmed: {
      title: 'Order Ready for Verification',
      message: `Your order #${orderId.slice(
        0,
        8
      )} has been confirmed by Prestige Shop. Please review and confirm the items: ${orderItems
        .map((i) => `${i.quantity}x ${i.name}`)
        .join(', ')}`,
    },
    customer_confirmed: {
      title: 'Order Confirmed',
      message: `Your order #${orderId.slice(
        0,
        8
      )} has been confirmed and is being prepared.`,
    },
    processing: {
      title: 'Order Processing',
      message: `Your order #${orderId.slice(
        0,
        8
      )} is being processed and prepared for fulfillment.`,
    },
    completed: {
      title: 'Order Completed',
      message: `Your order #${orderId.slice(
        0,
        8
      )} has been completed and is ready for pickup/delivery.`,
    },
    cancelled: {
      title: 'Order Cancelled',
      message: `Your order #${orderId.slice(0, 8)} has been cancelled.`,
    },
  };

  const statusKey = status === 'pharmacy_confirmed' ? 'shop_confirmed' : status;
  const statusInfo = statusMessages[statusKey];
  if (statusInfo) {
    await createNotification(
      userId,
      'order_update',
      statusInfo.title,
      statusInfo.message,
      orderId
    );
  }
}
