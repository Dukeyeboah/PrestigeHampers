# GitHub Setup — Prestige Hampers

Repository: [Dukeyeboah/PrestigeHampers](https://github.com/Dukeyeboah/PrestigeHampers)

## Push changes

```bash
cd /Users/duke/Documents/GitHub/PrestigeHampers

git add .
git commit -m "Your commit message"
git push origin main
```

## Environment variables

Create `.env.local` locally (never commit this file):

```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=prestigehampers-74114
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_ADMIN_PORTAL_PASSKEY=Prestige!!
NEXT_PUBLIC_SITE_URL=https://your-production-domain.com
```

For Vercel or other hosts, add the same variables in the project settings.

## Firebase deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes,storage
```
