import 'server-only';
import { orderDb, signedInUser } from './server';
import { adminAllowed } from './order-management';
export async function orderAdmin(request:Request) {
 let user;
 try {user=await signedInUser(request);} catch {return null;}
 if(!user?.email_verified || !user.email)return null;
 const allowed=(process.env.PAYSTACK_TEST_ADMIN_EMAILS||process.env.ORDER_NOTIFICATION_EMAIL||'').split(',').map(s=>s.trim().toLowerCase());
 if(adminAllowed(user,allowed))return user;
 // Dedicated collection is denied to browser clients by default. Console/Admin SDK only.
 const assignment=await orderDb().collection('paystack_test_admins').doc(user.uid).get();
 return adminAllowed(user,allowed,assignment.data())?user:null;
}
