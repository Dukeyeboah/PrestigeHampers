import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';
import { seedPrestigeInventory } from '../lib/seed-inventory';

const envPath = path.join(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  console.error(
    'Error: .env.local file not found. Please create it with your Firebase credentials.'
  );
  process.exit(1);
}

const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: bucket,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function main() {
  console.log('Seeding Prestige catalog into Firestore `inventory`…');
  console.log(`Bucket: ${bucket}`);
  console.log('');
  console.log(
    'NOTE: If this fails with PERMISSION_DENIED, either:'
  );
  console.log(
    '  1. Temporarily allow inventory writes in Firestore rules (see FIRESTORE_RULES_TEMPORARY.txt), OR'
  );
  console.log(
    '  2. Go to /admin → Manage Inventory → "Import sample products" while signed in as admin.'
  );
  console.log('');

  const { success, failed } = await seedPrestigeInventory(db, bucket);

  console.log(`Done: ${success} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
