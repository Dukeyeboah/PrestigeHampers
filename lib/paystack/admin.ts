import 'server-only';
import { orderDb, signedInUser } from './server';
import { adminAllowed } from './order-management';
export async function orderAdmin(request:Request) {
 let user;
 try {user=await signedInUser(request);} catch {return null;}
 if(!user?.email_verified || !user.email)return null;
 // Read the current Console-managed role on every request, including updates.
 const profile=await orderDb().collection('users').doc(user.uid).get();
 return adminAllowed(user,profile.data())?user:null;
}
