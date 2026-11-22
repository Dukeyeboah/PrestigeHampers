import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js/core';
import metadata from 'libphonenumber-js/metadata.max.json';
export type PhoneKind = 'local' | 'whatsapp';
export function normalizePhone(value: string, country: CountryCode = 'GH', kind: PhoneKind = 'whatsapp'): string | null {
  const parsed = parsePhoneNumberFromString(value.trim(), { defaultCountry: kind === 'local' ? 'GH' : country, extract: false }, metadata);
  if (!parsed?.isValid() || parsed.ext || (kind === 'local' && parsed.country !== 'GH')) return null;
  return parsed.number;
}
export const GHANA_REGIONS = ['Ahafo','Ashanti','Bono','Bono East','Central','Eastern','Greater Accra','North East','Northern','Oti','Savannah','Upper East','Upper West','Volta','Western','Western North'];
