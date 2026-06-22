const GUEST_ID_KEY = 'prestige_guest_id';

export function getOrCreateGuestId(): string {
  if (typeof window === 'undefined') return 'guest_server';

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${crypto.randomUUID()}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}
