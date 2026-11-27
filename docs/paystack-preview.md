# Paystack test preview

Branch: `feature/paystack-test-checkout`. This implementation deliberately rejects live keys and Vercel's Production environment. Do not merge it into production until the live-payment rollout has been reviewed.

## Preview environment variables

- `PAYSTACK_SECRET_KEY`: `sk_test_…` (server-only, sensitive).
- `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY`: `pk_test_…` (reserved for inline checkout; hosted checkout currently initializes server-side and doesn't require it).
- `FIREBASE_SERVICE_ACCOUNT_JSON`: full downloaded service-account JSON, unchanged. Must belong to `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
- `ORDER_NOTIFICATION_EMAIL`: merchant notification recipient; also the default test-order admin allowlist.
- Optional `PAYSTACK_TEST_ADMIN_EMAILS`: comma-separated verified Firebase account emails allowed to read test orders.
- Optional `PAYSTACK_WEBHOOK_SECRET`: Paystack's newer `whsec_…` signing secret if enabled. Legacy `x-paystack-signature` is verified with the test API secret.
- Optional `RESEND_API_KEY` and `ORDER_NOTIFICATION_FROM`: email delivery requires both and a verified sender. Until configured, orders remain saved with `notificationStatus: not_configured`.

Never commit actual secrets or service-account files. No credentials are needed at build time.

## Webhook

Set the **Test** webhook URL in Paystack to the branch's stable preview hostname plus `/api/paystack/webhook`. It must accept public POST requests without Vercel authentication, redirects, or a browser cookie. Test access before configuring Paystack. If preview protection is enabled, configure a supported automation bypass rather than pointing Paystack to a login page.

The handler checks raw-body signatures, verifies the transaction with Paystack, matches test mode, reference, GHS currency and server-priced amount, then atomically saves one paid order. Repeated webhook and browser-return confirmations share the same transaction and order ID. Database failures return 503 for retry. Merchant email uses a provider idempotency key; delivery failures retry with the webhook, and must be monitored if retries expire. Do not interpret receipt-page redirects as proof of payment.

## Data and access

Test collections: `paystack_test_checkouts`, `paystack_test_orders`, `paystack_test_limits`. Server SDK only; existing Firestore rules deny browser access by default. No live orders, stock or production alerts are changed. Configure Firestore TTL on `paystack_test_limits.expiresAt` for cleanup. Paid orders can be viewed at `/admin/paystack-test-orders` using an allowlisted, verified Firebase identity. Buyer receipts need a matching HttpOnly cookie in the browser that initialized checkout.

Prices and availability are rebuilt from the existing catalog + inventory overrides on the server. Client prices are only compared to detect stale bags. The order is stored before Paystack initialization; initialized attempts reuse their payment reference. Unpaid abandoned drafts are retained for reconciliation, not displayed as paid orders. Stock is checked at initialization but is not reserved/decremented in this test preview.

## Customer flow

Bag → contact/delivery details (email required) → test Paystack hosted checkout (card/MoMo) → verified receipt. Delivery charges are explicitly separate. A receipt offers an optional WhatsApp draft marked TEST and a choice to remove only the purchased quantities from the bag. No WhatsApp message is sent automatically.

## Verification

Run `node --conditions=react-server --import tsx --test tests/*.test.ts` and `next build --webpack`.

Use Paystack's test card `4084084084084081`, CVV `408`, any future expiry, only in the TEST gateway. Declined card: `4084080000005408`, CVV `001`. Confirm success creates a single test order, reloads don't duplicate it, pending/failed payments don't create paid orders, unsigned webhook POST returns 401, unauthenticated admin API returns 403, and wrong receipt cookies don't expose customer information.

Before production: activate merchant account and channels, configure sender email, reconcile delivery policy, review reservation/fulfilment/refund handling and existing Firebase role rules, add production secrets separately, remove the explicit test guard only as part of that reviewed rollout, and use production collections/webhook separately.

## Test order management dashboard

Open `/admin/paystack-test-orders` on the preview and sign in with Google. The server authorises verified emails in `PAYSTACK_TEST_ADMIN_EMAILS` (or `ORDER_NOTIFICATION_EMAIL` as the fallback). To manage additional users in Firebase without trusting browser-editable profiles:

1. Have the person sign in once. In Firebase Console → Authentication → Users, copy their UID.
2. In Firestore Database → Data, create collection `paystack_test_admins` and a document whose ID is that UID.
3. Add `role` (string) = `admin` and `active` (boolean) = `true`.
4. To revoke this assignment, set `active` to `false`. If their email is also on the environment allowlist, remove it there and redeploy too.

This collection has no browser access under the existing default-deny rules; manage it via Firebase Console or trusted Admin SDK only. Ordinary `users.role` is deliberately not trusted because legacy profile-creation rules allow clients to specify that field. No shared production rules or roles are changed in this preview.

Dashboard: newest 50 orders first; load older pages for full history. Search, fulfilment filters, counts and paid totals cover the loaded orders (clearly labelled). Details include items, verified payment reference, customer contact, delivery information and notes. Fulfilment statuses are New, Preparing, Ready for pickup, Out for delivery, Fulfilled and Cancelled. Each save requires an internal note and appends actor/time/status history atomically with a version check, preventing silent overwrites from multiple admins. Reload an order after a conflict. Cancelling fulfilment never changes payment status or initiates a refund. Payment fields cannot be edited through this API. No WhatsApp message is sent by dashboard updates.
