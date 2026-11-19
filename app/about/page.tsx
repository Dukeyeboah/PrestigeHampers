import { TopNav } from '@/components/top-nav';
import Link from 'next/link';
import { WHATSAPP_ORDER_CHAT_DIGITS } from '@/lib/whatsapp-order';
export default function About() {
 return <><TopNav/><main className='max-w-3xl mx-auto px-5 pt-32 pb-16 space-y-12'>
 <section className='space-y-4'><p className='uppercase text-sm tracking-widest text-[#c3483a]'>About us</p><h1 className='font-serif text-4xl'>Thoughtful gifts, made simple.</h1><p className='leading-relaxed'>Prestige Hampers brings together beautifully curated gift hampers and premium treats. From celebrations to everyday moments, find something special to share.</p></section>
 <section id='delivery' className='space-y-6 scroll-mt-28'><h2 className='font-serif text-3xl'>Delivery & FAQs</h2>
 <div><h3>How do I order?</h3><p className='mt-2 leading-relaxed'>Choose a hamper, select your quantity, and checkout from your cart. We prepare your order message in WhatsApp; send it to us to confirm availability and arrange your order. You can order as a guest or sign in to save orders to your account.</p></div>
 <div><h3>What’s inside each hamper?</h3><p className='mt-2'>Select a hamper image to see its full contents and description.</p></div>
 <div><h3>How are delivery and payment arranged?</h3><p className='mt-2 leading-relaxed'>Choose cash or Mobile Money at checkout. Include your delivery instructions in the notes; we’ll confirm collection or delivery details and any delivery charges with you on WhatsApp.</p></div></section>
 <section id='contact' className='space-y-4 scroll-mt-28'><h2 className='font-serif text-3xl'>Let’s find your gift.</h2><a href={`https://wa.me/${WHATSAPP_ORDER_CHAT_DIGITS}`} className='inline-flex bg-primary text-primary-foreground rounded-lg px-6 py-3'>Contact us on WhatsApp</a></section>
 <Link href='/products' className='underline underline-offset-4'>Browse all hampers</Link>
 </main></>;
}
