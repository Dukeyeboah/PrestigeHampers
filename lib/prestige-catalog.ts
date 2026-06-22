import type { Product } from '@/types';

/** Local product image under /public/images/products/N.jpg */
export function getProductImageUrl(imageNumber: number): string {
  return `/images/products/${imageNumber}.jpg`;
}

function dateToTimestamp(dateString: string): number {
  const [day, month, year] = dateString.split('-').map((v) => parseInt(v, 10));
  return new Date(year, month - 1, day).getTime();
}

const CATALOG: Omit<
  Product,
  'id' | 'code' | 'imageUrl' | 'updatedAt' | 'expiryDate'
>[] = [
  { name: 'Dove Shower Gel', category: 'Bath & Body', price: 12.99, stock: 40, unit: 'bottle', description: 'Luxuriously moisturising Dove shower gel for daily pampering.' },
  { name: 'English Shortbread Biscuit', category: 'Biscuits & Treats', price: 9.5, stock: 30, unit: 'tin', description: 'Classic English shortbread biscuits in a gift tin.' },
  { name: 'Maltesers Chocolate', category: 'Chocolate & Sweets', price: 7.25, stock: 50, unit: 'box', description: 'Light, crispy Maltesers chocolates — a hamper favourite.' },
  { name: 'Luxury Tea Selection', category: 'Tea & Coffee', price: 18.0, stock: 25, unit: 'box', description: 'Assorted premium tea bags in an elegant gift box.' },
  { name: 'Premium Coffee Beans', category: 'Tea & Coffee', price: 22.5, stock: 20, unit: 'bag', description: 'Rich, aromatic roasted coffee beans for the perfect brew.' },
  { name: 'Belgian Chocolates', category: 'Chocolate & Sweets', price: 15.99, stock: 35, unit: 'box', description: 'Hand-selected Belgian chocolate assortment.' },
  { name: 'Artisan Honey Jar', category: 'Snacks & Nuts', price: 14.0, stock: 28, unit: 'jar', description: 'Pure artisan honey, ideal for breakfast hampers.' },
  { name: 'Scottish Shortbread Tin', category: 'Biscuits & Treats', price: 11.5, stock: 32, unit: 'tin', description: 'Buttery Scottish shortbread in a keepsake tin.' },
  { name: 'Rose Body Lotion', category: 'Personal Care', price: 16.75, stock: 22, unit: 'bottle', description: 'Delicately scented rose body lotion for silky skin.' },
  { name: 'Champagne Truffles', category: 'Chocolate & Sweets', price: 19.99, stock: 18, unit: 'box', description: 'Decadent champagne-infused chocolate truffles.' },
  { name: 'Gourmet Nuts Mix', category: 'Snacks & Nuts', price: 13.5, stock: 45, unit: 'tin', description: 'Premium roasted nut mix with sea salt.' },
  { name: 'Lavender Bath Salts', category: 'Bath & Body', price: 17.0, stock: 24, unit: 'jar', description: 'Relaxing lavender bath salts for a spa-like experience.' },
  { name: 'Red Wine Selection', category: 'Wine & Spirits', price: 45.0, stock: 15, unit: 'bottle', description: 'Carefully selected red wine for celebration hampers.' },
  { name: 'Sparkling Juice', category: 'Wine & Spirits', price: 8.99, stock: 38, unit: 'bottle', description: 'Non-alcoholic sparkling juice for all occasions.' },
  { name: 'Handcrafted Cookies', category: 'Biscuits & Treats', price: 10.5, stock: 36, unit: 'box', description: 'Freshly baked handcrafted cookies in a ribboned box.' },
  { name: 'Fruit Preserve Set', category: 'Snacks & Nuts', price: 12.0, stock: 27, unit: 'set', description: 'Trio of artisan fruit preserves with rustic labels.' },
  { name: 'Aromatherapy Candle', category: 'Home & Lifestyle', price: 21.0, stock: 20, unit: 'candle', description: 'Soy aromatherapy candle with a calming fragrance.' },
  { name: 'Silk Eye Mask', category: 'Personal Care', price: 24.99, stock: 16, unit: 'piece', description: 'Luxurious silk eye mask for restful sleep.' },
  { name: 'Premium Biscotti', category: 'Biscuits & Treats', price: 9.99, stock: 33, unit: 'pack', description: 'Crunchy Italian biscotti, perfect with coffee.' },
  { name: 'Cocoa Drinking Chocolate', category: 'Tea & Coffee', price: 11.25, stock: 29, unit: 'tin', description: 'Rich drinking chocolate for cosy evenings.' },
  { name: 'Cheese Crackers Selection', category: 'Snacks & Nuts', price: 8.5, stock: 42, unit: 'box', description: 'Crisp cheese crackers paired with fine accompaniments.' },
  { name: 'Celebration Hamper Box', category: 'Gift Sets', price: 89.99, stock: 12, unit: 'hamper', description: 'Our signature celebration hamper — the ultimate gift.' },
];

const EXPIRY_DATES = [
  '2-10-2027', '5-11-2027', '12-9-2027', '1-3-2028', '15-6-2027',
  '20-8-2027', '3-12-2027', '7-4-2028', '18-1-2028', '25-10-2027',
  '9-7-2027', '14-2-2028', '30-11-2027', '6-5-2028', '22-9-2027',
  '11-3-2028', '28-12-2027', '4-8-2027', '16-6-2028', '10-10-2027',
  '19-4-2028', '8-12-2027',
];

/** Generate prestig-prefixed product id, e.g. prestig-001 */
export function buildPrestigeProductId(index: number): string {
  return `prestig-${String(index).padStart(3, '0')}`;
}

export function buildPrestigeCatalog(): Product[] {
  return CATALOG.map((item, index) => {
    const num = index + 1;
    const id = buildPrestigeProductId(num);
    const expiry = EXPIRY_DATES[index] || '1-1-2028';
    return {
      ...item,
      id,
      code: id,
      imageUrl: getProductImageUrl(num),
      updatedAt: dateToTimestamp(expiry),
      expiryDate: dateToTimestamp(expiry),
    };
  });
}
