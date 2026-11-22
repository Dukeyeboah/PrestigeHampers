'use client';
import { useEffect, useRef, useId } from 'react';
import { getCountries, getCountryCallingCode, type CountryCode } from 'libphonenumber-js';
import { normalizePhone, type PhoneKind } from '@/lib/phone-number';
const names = new Intl.DisplayNames(['en'], { type: 'region' });
const countries = getCountries().sort((a,b)=>(names.of(a)||a).localeCompare(names.of(b)||b));
export function PhoneField({label,value,country,kind,onChange}:{label:string;value:string;country:CountryCode;kind:PhoneKind;onChange:(value:string,country:CountryCode,kind:PhoneKind)=>void}) {
 const id=useId(); const input=useRef<HTMLInputElement>(null); const normalized=normalizePhone(value,country,kind);
 useEffect(()=>{input.current?.setCustomValidity(value&&!normalized?'Enter a valid phone number for the selected country.':'');},[value,normalized]);
 return <div className='phone-field'><div className='phone-kind' role='radiogroup' aria-label={`${label} number type`}>{(['local','whatsapp'] as const).map(type=><label key={type}><input type='radio' name={`${id}-kind`} checked={kind===type} onChange={()=>onChange(value,type==='local'?'GH':country,type)}/>{type==='local'?'Local number':'WhatsApp number'}</label>)}</div><div className='phone-number-row'><label>Country code<select aria-label={`${label} country code`} disabled={kind==='local'} value={kind==='local'?'GH':country} onChange={e=>onChange(value,e.target.value as CountryCode,kind)}>{countries.map(c=><option key={c} value={c}>{c} +{getCountryCallingCode(c)}</option>)}</select></label><label htmlFor={id}>Phone number<input ref={input} id={id} required type='tel' inputMode='tel' autoComplete='tel-national' value={value} placeholder={country==='GH'?'0245667892':'Enter phone number'} onChange={e=>{e.target.setCustomValidity('');onChange(e.target.value,country,kind);}} aria-describedby={`${id}-hint`}/></label></div><p id={`${id}-hint`} className='field-note'>{normalized?`Saved as ${normalized}${kind==='whatsapp'?' · WhatsApp':' · Calls / SMS'}`:kind==='local'?'Enter a Ghana phone number, for example 0245667892.':'Select a country and enter the number, including the local leading zero if needed.'}</p></div>;
}
