import { 
  Product, 
  Category, 
  StoreSettings, 
  Coupon, 
  Order, 
  Customer, 
  Review, 
  AuditLog, 
  User 
} from '../types';

export const INITIAL_SETTINGS: StoreSettings = {
  businessName: 'Trendy & Bendy',
  tagline: 'Your Trend. Your Bendy. Curated Aesthetic Finds & Pre-Orders.',
  logoUrl: '',
  contactEmail: 'tanvir088033@gmail.com',
  contactPhone: '+880 1712-345678',
  address: 'Banani Road 11, Dhaka 1213, Bangladesh',
  currency: 'BDT',
  currencySymbol: '৳',
  instagramUrl: 'https://www.instagram.com/trendy_.and_.bendy/',
  facebookUrl: 'https://facebook.com/trendy.and.bendy',
  tiktokUrl: 'https://tiktok.com/@trendy_bendy',
  defaultPreorderAdvancePercentage: 60,
  defaultEstimatedDeliveryText: '35–45 days after preorder closes',
  freeShippingThreshold: 5000,
  announcementBar: {
    enabled: true,
    text: '✨ Pre-orders are now LIVE! Pay 60% advance to secure your drop · Nationwide delivery',
    linkText: 'Shop Pre-Orders',
    linkUrl: '/pre-order'
  },
  heroBanner: {
    heading: 'Your Trend. Your Bendy.',
    subheading: 'Discover viral aesthetic gadgets, statement accessories, and exclusive drops reserved just for you.',
    buttonText: 'Explore Pre-Orders',
    buttonUrl: '/pre-order',
    secondaryButtonText: 'Browse In Stock',
    secondaryButtonUrl: '/shop',
    backgroundImage: '/src/assets/images/hero_trendy_showcase_1791153752287.jpg',
    active: true
  },
  shippingZones: [
    {
      id: 'dhaka_inside',
      name: 'Inside Dhaka (Standard 2-3 Days)',
      rate: 70,
      estimatedDays: '2–3 business days',
      freeShippingAbove: 3500,
      isActive: true
    },
    {
      id: 'dhaka_outside',
      name: 'Outside Dhaka / Nationwide (3-5 Days)',
      rate: 130,
      estimatedDays: '3–5 business days',
      freeShippingAbove: 5000,
      isActive: true
    },
    {
      id: 'dhaka_express',
      name: 'Dhaka Same Day / Next Day Express',
      rate: 160,
      estimatedDays: '1 business day',
      isActive: true
    }
  ],
  paymentMethods: [
    {
      id: 'BKASH',
      name: 'bKash (Send Money / Merchant)',
      enabled: true,
      accountType: 'Personal / Merchant',
      accountNumber: '01712-345678',
      instructions: 'Send the required advance (or full total) to our bKash account. After payment, enter your bKash Transaction ID (TrxID) and 11-digit Sender Number below.',
      requiresProof: true,
      badge: 'Most Popular',
      gatewaySupported: true,
      gatewayMode: 'MANUAL_TRXID',
      envVars: ['VITE_BKASH_APP_KEY', 'VITE_BKASH_APP_SECRET']
    },
    {
      id: 'NAGAD',
      name: 'Nagad',
      enabled: true,
      accountType: 'Personal / Merchant',
      accountNumber: '01712-345678',
      instructions: 'Send money to our Nagad wallet. Enter the 8-character Transaction ID (TrxID) and your sender number below.',
      requiresProof: true,
      gatewaySupported: true,
      gatewayMode: 'MANUAL_TRXID',
      envVars: ['VITE_NAGAD_MERCHANT_ID', 'VITE_NAGAD_PUBLIC_KEY']
    },
    {
      id: 'SSLCOMMERZ',
      name: 'SSLCommerz (Cards / MFS)',
      enabled: true,
      accountType: 'Online Gateway / Direct Pay',
      accountNumber: 'SSL-MERCHANT-TB',
      instructions: 'Pay online via Cards, Net Banking, or MFS. In manual mode, enter your payment receipt reference or bank deposit ID below.',
      requiresProof: true,
      badge: 'Cards / Banking',
      gatewaySupported: true,
      gatewayMode: 'MANUAL_TRXID',
      envVars: ['VITE_SSLCOMMERZ_STORE_ID', 'VITE_SSLCOMMERZ_STORE_PASS']
    },
    {
      id: 'ROCKET',
      name: 'Rocket',
      enabled: true,
      accountType: 'Personal',
      accountNumber: '01712-345678-9',
      instructions: 'Transfer through DBBL Rocket and provide your TrxID below.',
      requiresProof: true,
      gatewaySupported: false,
      gatewayMode: 'MANUAL_TRXID'
    },
    {
      id: 'BANK_TRANSFER',
      name: 'Direct Bank Transfer',
      enabled: true,
      accountType: 'Bank Asia / City Bank',
      accountNumber: '1042-8800-99120',
      instructions: 'Account Name: Trendy & Bendy. Branch: Banani. Please enter deposit transaction ID or slip reference below.',
      requiresProof: true,
      gatewaySupported: false,
      gatewayMode: 'MANUAL_TRXID'
    },
    {
      id: 'COD',
      name: 'Cash on Delivery (In-Stock items only)',
      enabled: true,
      accountType: 'Cash',
      accountNumber: 'N/A',
      instructions: 'Pay in cash upon physical delivery. Note: Pre-order items require a 60% advance deposit and cannot be ordered purely on COD.',
      requiresProof: false,
      gatewaySupported: false,
      gatewayMode: 'MANUAL_TRXID'
    }
  ],
  policies: {
    shippingPolicy: `### Delivery Timelines & Rates
- **In-Stock Orders**: Dispatched within 24 hours. Delivery takes 2-3 business days inside Dhaka (৳70) and 3-5 business days outside Dhaka (৳130).
- **Pre-Order Orders**: Estimated delivery is approximately 35–45 days after the designated pre-order batch closing date.
- **Tracking**: You will receive an SMS and an updated tracking timeline in your account once your parcel is handed over to Pathao/Steadfast courier.`,
    returnPolicy: `### Returns & Exchanges
- **In-Stock Items**: Eligible for return/exchange within 48 hours of delivery if defective, damaged, or mismatched.
- **Pre-Order Items**: Custom reserved upon customer advance payment. In case of manufacturing defect or lost shipment, a 100% full refund or replacement is provided immediately.
- To initiate an exchange, message us on Instagram @trendy_.and_.bendy or via our website contact form with your Order ID and unboxing video.`,
    preorderPolicy: `### How Trendy & Bendy Pre-Orders Work
1. **Advance Deposit**: A 60% advance payment is required to confirm your pre-order slot before the batch closes.
2. **Batch Closing**: Once the batch timer reaches zero, pre-orders are locked and submitted to manufacturing/import.
3. **Arrival & Inspection**: Once products arrive at our Dhaka sorting hub (approx. 35–45 days after close), we inspect quality and notify you.
4. **Remaining Balance**: The remaining 40% balance can be paid online or via Cash on Delivery when the parcel is dispatched.`,
    paymentPolicy: `### Payment Methods & Verification
- We accept bKash, Nagad, Rocket, Bank Transfer, and Cash on Delivery (for available in-stock items).
- When using mobile financial services, always verify the TrxID submitted in checkout. Payments are manually cross-verified by our order management team within 1-3 hours.`,
    termsAndConditions: `### Terms & Conditions
By placing an order on Trendy & Bendy, you agree to our advance reservation model for pre-order goods, shipping timeframes, and customer conduct policies. All intellectual property and trademarks belong to their respective creators.`,
    privacyPolicy: `### Privacy Policy
Trendy & Bendy respects your privacy. We collect customer names, shipping addresses, phone numbers, and transaction IDs exclusively for fulfilling your orders, sending shipment updates, and customer support. We never sell or share your information.`
  }
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-gadgets',
    name: 'Aesthetic Gadgets',
    slug: 'gadgets',
    description: 'Nostalgic retro tech, mini flip phones, and viral audio accessories',
    image: '/src/assets/images/retro_mp3_player_1791153763636.jpg',
    itemCount: 2,
    isActive: true
  },
  {
    id: 'cat-footwear',
    name: 'Shoes & Heels',
    slug: 'shoes',
    description: 'Statement fashion heels, kitten pumps, and trendy Y2K footwear',
    image: '/src/assets/images/fashion_heels_1791153787400.jpg',
    itemCount: 1,
    isActive: true
  },
  {
    id: 'cat-accessories',
    name: 'Accessories',
    slug: 'accessories',
    description: 'Lipstick keychains, bag charms, sunglasses, and cute daily essentials',
    image: '/src/assets/images/lipstick_keychain_1791153799684.jpg',
    itemCount: 2,
    isActive: true
  },
  {
    id: 'cat-beauty',
    name: 'Beauty & Personal Care',
    slug: 'beauty',
    description: 'Facial trimmers, aesthetic beauty tools, and vanity accessories',
    image: '/src/assets/images/hero_trendy_showcase_1791153752287.jpg',
    itemCount: 1,
    isActive: true
  },
  {
    id: 'cat-fashion',
    name: 'Fashion & Apparel',
    slug: 'fashion',
    description: 'Chic silhouettes, cute coordinates, and trendy seasonal drops',
    image: '/src/assets/images/hero_trendy_showcase_1791153752287.jpg',
    itemCount: 1,
    isActive: true
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-mp3-retro',
    sku: 'TB-MP3-01',
    name: 'Retro Portable MP3 Player',
    slug: 'retro-mp3-player',
    description: 'Bring back the golden era of pure music with our aesthetic Retro MP3 Player. Features a nostalgic click wheel, crisp OLED display, FM radio, microSD card support up to 64GB, and high-fidelity audio playback. Ultra-lightweight and pocket-sized with an irresistibly cute pastel finish.',
    shortDescription: 'Nostalgic pocket MP3 player with click wheel, OLED display & studio audio output.',
    brand: 'Trendy & Bendy',
    category: 'Aesthetic Gadgets',
    tags: ['retro', 'gadgets', 'y2k', 'aesthetic', 'preorder', 'music'],
    status: 'PRE_ORDER',
    productType: 'PREORDER',
    costPrice: 1500,
    regularPrice: 2800,
    salePrice: 2500,
    currency: 'BDT',
    stockQuantity: 50,
    reservedStock: 18,
    lowStockThreshold: 10,
    images: [
      { url: '/src/assets/images/retro_mp3_player_1791153763636.jpg', alt: 'Retro Portable MP3 Player in Baby Pink', isMain: true }
    ],
    variants: [
      { id: 'v-mp3-pink', sku: 'TB-MP3-01-PNK', name: 'Baby Pink', color: '#FBCFE8', priceAdjustment: 0, stock: 25, isActive: true },
      { id: 'v-mp3-silver', sku: 'TB-MP3-01-SLV', name: 'Cyber Silver', color: '#E5E7EB', priceAdjustment: 0, stock: 15, isActive: true },
      { id: 'v-mp3-blue', sku: 'TB-MP3-01-BLU', name: 'Pastel Sky', color: '#BAE6FD', priceAdjustment: 0, stock: 10, isActive: true }
    ],
    preorderSettings: {
      isPreorder: true,
      openingDate: '2026-10-01T00:00:00Z',
      closingDate: '2026-10-25T23:59:59Z',
      estimatedDeliveryMinDays: 35,
      estimatedDeliveryMaxDays: 45,
      advancePercentage: 60,
      maxQuantity: 100,
      currentPreorderQuantity: 32,
      preorderStatus: 'OPEN'
    },
    instagramPostUrl: 'https://www.instagram.com/p/trendy_mp3_reel/',
    instagramCaption: 'The retro music player you all have been DMing us about is finally open for pre-order! 💿 Only 60% advance needed. Link in bio!',
    rating: 4.9,
    reviewCount: 28,
    featured: true,
    isTrending: true,
    isNewArrival: true,
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'prod-flip-phone',
    sku: 'TB-FLP-02',
    name: 'Aesthetic Mini Flip Phone',
    slug: 'mini-flip-phone',
    description: 'Unplug in pure style with this viral Mini Flip Phone. Features dual SIM standby, nostalgic clicky keypad, basic camera, Bluetooth, and crystal clear call reception. Pocket-sized cuteness that fits in the tiniest mini handbag for your aesthetic night outs.',
    shortDescription: 'Ultra-compact nostalgic mini flip phone with dual SIM, Bluetooth & camera.',
    brand: 'Trendy & Bendy',
    category: 'Aesthetic Gadgets',
    tags: ['flip-phone', 'gadgets', 'aesthetic', 'y2k', 'preorder'],
    status: 'PRE_ORDER',
    productType: 'PREORDER',
    costPrice: 3200,
    regularPrice: 5400,
    salePrice: 4950,
    currency: 'BDT',
    stockQuantity: 40,
    reservedStock: 22,
    lowStockThreshold: 5,
    images: [
      { url: '/src/assets/images/mini_flip_phone_1791153774162.jpg', alt: 'Aesthetic Mini Flip Phone Lilac', isMain: true }
    ],
    variants: [
      { id: 'v-flp-lilac', sku: 'TB-FLP-02-LIL', name: 'Lilac Dream', color: '#DDD6FE', priceAdjustment: 0, stock: 20, isActive: true },
      { id: 'v-flp-pink', sku: 'TB-FLP-02-PNK', name: 'Blush Pink', color: '#FCE7F3', priceAdjustment: 0, stock: 12, isActive: true },
      { id: 'v-flp-pearl', sku: 'TB-FLP-02-PRL', name: 'Pearl White', color: '#F9FAFB', priceAdjustment: 0, stock: 8, isActive: true }
    ],
    preorderSettings: {
      isPreorder: true,
      openingDate: '2026-10-01T00:00:00Z',
      closingDate: '2026-10-28T23:59:59Z',
      estimatedDeliveryMinDays: 35,
      estimatedDeliveryMaxDays: 45,
      advancePercentage: 60,
      maxQuantity: 60,
      currentPreorderQuantity: 28,
      preorderStatus: 'OPEN'
    },
    instagramPostUrl: 'https://www.instagram.com/p/trendy_flip_phone/',
    instagramCaption: 'Say goodbye to screen fatigue with the cutest mini flip phone 🎀 Taking pre-orders now!',
    rating: 4.8,
    reviewCount: 19,
    featured: true,
    isTrending: true,
    isBestSeller: true,
    createdAt: '2026-10-02T10:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'prod-heels-crystal',
    sku: 'TB-SH-03',
    name: 'Crystal Strap Pointed Kitten Heels',
    slug: 'fashion-kitten-heels',
    description: 'Elevate any evening look with these pointed-toe designer kitten heels. Crafted with satin lining, cushioned insole for all-day comfort, and an exquisite crystal wrap strap that catches every ray of light. Perfect 2.5-inch heel height.',
    shortDescription: 'Pointed kitten heels with sparkling crystal strap & cushioned satin insole.',
    brand: 'Trendy & Bendy Footwear',
    category: 'Shoes & Heels',
    tags: ['heels', 'shoes', 'fashion', 'kitten-heels', 'party', 'preorder'],
    status: 'PRE_ORDER',
    productType: 'PREORDER',
    costPrice: 2400,
    regularPrice: 4200,
    salePrice: 3800,
    currency: 'BDT',
    stockQuantity: 30,
    reservedStock: 14,
    lowStockThreshold: 5,
    images: [
      { url: '/src/assets/images/fashion_heels_1791153787400.jpg', alt: 'Fashion Kitten Heels with Crystal Strap', isMain: true }
    ],
    variants: [
      { id: 'v-sh-36', sku: 'TB-SH-03-36', name: 'EU 36 / US 6', size: '36', priceAdjustment: 0, stock: 5, isActive: true },
      { id: 'v-sh-37', sku: 'TB-SH-03-37', name: 'EU 37 / US 6.5', size: '37', priceAdjustment: 0, stock: 8, isActive: true },
      { id: 'v-sh-38', sku: 'TB-SH-03-38', name: 'EU 38 / US 7.5', size: '38', priceAdjustment: 0, stock: 9, isActive: true },
      { id: 'v-sh-39', sku: 'TB-SH-03-39', name: 'EU 39 / US 8.5', size: '39', priceAdjustment: 0, stock: 5, isActive: true },
      { id: 'v-sh-40', sku: 'TB-SH-03-40', name: 'EU 40 / US 9', size: '40', priceAdjustment: 0, stock: 3, isActive: true }
    ],
    preorderSettings: {
      isPreorder: true,
      openingDate: '2026-10-01T00:00:00Z',
      closingDate: '2026-10-30T23:59:59Z',
      estimatedDeliveryMinDays: 35,
      estimatedDeliveryMaxDays: 45,
      advancePercentage: 60,
      maxQuantity: 50,
      currentPreorderQuantity: 24,
      preorderStatus: 'OPEN'
    },
    instagramPostUrl: 'https://www.instagram.com/p/trendy_crystal_heels/',
    instagramCaption: 'Cinderella moments incoming ✨ Pre-order your size now before our factory booking closes!',
    rating: 5.0,
    reviewCount: 34,
    featured: true,
    isTrending: true,
    createdAt: '2026-10-01T14:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'prod-lipstick-keychain',
    sku: 'TB-ACC-04',
    name: 'Quilted Lipstick Holder Keychain',
    slug: 'lipstick-holder-keychain',
    description: 'Never lose your favorite lip shade in the depths of your tote bag again! Made from quilted vegan leather with a snap button closure and luxury gold-tone clasp. Attaches effortlessly to keys, belt loops, or handbags.',
    shortDescription: 'Quilted vegan leather keychain case for your favorite lipsticks & balms.',
    brand: 'Trendy & Bendy',
    category: 'Accessories',
    tags: ['keychain', 'accessories', 'lipstick', 'in-stock', 'gift'],
    status: 'IN_STOCK',
    productType: 'SIMPLE',
    costPrice: 380,
    regularPrice: 850,
    salePrice: 750,
    currency: 'BDT',
    stockQuantity: 36,
    reservedStock: 4,
    lowStockThreshold: 10,
    images: [
      { url: '/src/assets/images/lipstick_keychain_1791153799684.jpg', alt: 'Quilted Lipstick Holder Keychain Charm', isMain: true }
    ],
    variants: [
      { id: 'v-lip-blush', sku: 'TB-ACC-04-BLS', name: 'Blush Pink', color: '#FBCFE8', priceAdjustment: 0, stock: 15, isActive: true },
      { id: 'v-lip-black', sku: 'TB-ACC-04-BLK', name: 'Noir Black', color: '#18181B', priceAdjustment: 0, stock: 12, isActive: true },
      { id: 'v-lip-tan', sku: 'TB-ACC-04-TAN', name: 'Caramel Tan', color: '#D97706', priceAdjustment: 0, stock: 9, isActive: true }
    ],
    instagramPostUrl: 'https://www.instagram.com/p/trendy_lipstick_keychain/',
    instagramCaption: 'The sweetest accessory your bag needed! In-stock and shipping nationwide within 48h 💄',
    rating: 4.9,
    reviewCount: 42,
    featured: true,
    isBestSeller: true,
    createdAt: '2026-09-20T10:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'prod-trimmer-beauty',
    sku: 'TB-BTY-05',
    name: 'Precision Facial Hair Trimmer & Shaper',
    slug: 'facial-hair-trimmer',
    description: 'Painless, gentle, and whisper-quiet precision trimmer designed for eyebrows, peach fuzz, and delicate facial areas. Built-in LED light reveals even the finest hairs for flawless makeup application.',
    shortDescription: 'Painless electric facial trimmer with built-in LED light & hypoallergenic blade.',
    brand: 'Trendy & Bendy Beauty',
    category: 'Beauty & Personal Care',
    tags: ['beauty', 'trimmer', 'skincare', 'in-stock', 'self-care'],
    status: 'IN_STOCK',
    productType: 'SIMPLE',
    costPrice: 650,
    regularPrice: 1450,
    salePrice: 1250,
    currency: 'BDT',
    stockQuantity: 22,
    reservedStock: 3,
    lowStockThreshold: 5,
    images: [
      { url: '/src/assets/images/hero_trendy_showcase_1791153752287.jpg', alt: 'Precision Facial Hair Trimmer', isMain: true }
    ],
    variants: [
      { id: 'v-trm-rose', sku: 'TB-BTY-05-RSG', name: 'Matte Rose Gold', color: '#FB7185', priceAdjustment: 0, stock: 14, isActive: true },
      { id: 'v-trm-white', sku: 'TB-BTY-05-WHT', name: 'Cloud White', color: '#FFFFFF', priceAdjustment: 0, stock: 8, isActive: true }
    ],
    instagramPostUrl: 'https://www.instagram.com/p/trendy_facial_trimmer/',
    instagramCaption: 'Glass skin prep starts here ✨ Painless dermaplaning at home. In stock now!',
    rating: 4.7,
    reviewCount: 15,
    isNewArrival: true,
    createdAt: '2026-09-25T11:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  },
  {
    id: 'prod-hair-clips',
    sku: 'TB-ACC-06',
    name: 'French Ribbon Coquette Hair Clip Set',
    slug: 'ribbon-hair-clip-set',
    description: 'Handmade double-bow velvet ribbon hair barrettes in romantic pastel hues. Sturdy French metal clasp holds fine to thick hair effortlessly without snagging.',
    shortDescription: 'Set of 2 handcrafted luxury velvet bow hair clips.',
    brand: 'Trendy & Bendy',
    category: 'Accessories',
    tags: ['coquette', 'hair-clips', 'accessories', 'y2k', 'in-stock'],
    status: 'IN_STOCK',
    productType: 'SIMPLE',
    costPrice: 200,
    regularPrice: 650,
    salePrice: 550,
    currency: 'BDT',
    stockQuantity: 45,
    reservedStock: 2,
    lowStockThreshold: 10,
    images: [
      { url: '/src/assets/images/hero_trendy_showcase_1791153752287.jpg', alt: 'Coquette Ribbon Hair Clip Set', isMain: true }
    ],
    variants: [
      { id: 'v-clp-pink', sku: 'TB-ACC-06-PNK', name: 'Soft Rose & Ivory', color: '#FCE7F3', priceAdjustment: 0, stock: 25, isActive: true },
      { id: 'v-clp-black', sku: 'TB-ACC-06-BLK', name: 'Classic Black & Wine', color: '#1E1E1E', priceAdjustment: 0, stock: 20, isActive: true }
    ],
    rating: 4.8,
    reviewCount: 12,
    isNewArrival: true,
    createdAt: '2026-09-28T09:00:00Z',
    updatedAt: '2026-10-04T12:00:00Z'
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c-trendy10',
    code: 'TRENDY10',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    minOrderValue: 1500,
    maxDiscount: 500,
    startDate: '2026-09-01T00:00:00Z',
    endDate: '2026-12-31T23:59:59Z',
    usageLimit: 200,
    usageCount: 42,
    isActive: true
  },
  {
    id: 'c-preorder500',
    code: 'PREORDER500',
    discountType: 'FIXED',
    discountValue: 500,
    minOrderValue: 4000,
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-10-31T23:59:59Z',
    usageLimit: 50,
    usageCount: 14,
    isActive: true
  },
  {
    id: 'c-freeship',
    code: 'FREESHIP',
    discountType: 'FREE_SHIPPING',
    discountValue: 0,
    minOrderValue: 3000,
    startDate: '2026-10-01T00:00:00Z',
    endDate: '2026-11-30T23:59:59Z',
    usageLimit: 100,
    usageCount: 29,
    isActive: true
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'TB-2026-000101',
    customerId: 'cust-1',
    customerName: 'Samira Rahman',
    customerEmail: 'samira.r@gmail.com',
    customerPhone: '01819-223344',
    shippingAddress: {
      fullName: 'Samira Rahman',
      phone: '01819-223344',
      email: 'samira.r@gmail.com',
      addressLine: 'House 42, Road 11, Block D',
      area: 'Banani',
      city: 'Dhaka',
      district: 'Dhaka',
      postalCode: '1213',
      deliveryNotes: 'Call before arriving, leave with security if unavailable.'
    },
    items: [
      {
        id: 'oi-1',
        productId: 'prod-mp3-retro',
        productName: 'Retro Portable MP3 Player',
        productImage: '/src/assets/images/retro_mp3_player_1791153763636.jpg',
        variantId: 'v-mp3-pink',
        variantName: 'Baby Pink',
        unitPrice: 2500,
        quantity: 1,
        isPreorder: true,
        advancePercentage: 60,
        advanceRequired: 1500,
        itemTotal: 2500
      }
    ],
    subtotal: 2500,
    discount: 0,
    shippingFee: 70,
    shippingZone: 'Inside Dhaka',
    totalAmount: 2570,
    hasPreorderItems: true,
    advanceAmountRequired: 1570, // 1500 advance + 70 shipping
    advancePaid: 1570,
    remainingBalance: 1000,
    orderStatus: 'PREORDER_CONFIRMED',
    paymentStatus: 'PARTIALLY_PAID',
    paymentMethod: 'BKASH',
    paymentDetails: {
      method: 'BKASH',
      transactionId: '9A7K8LM2QP',
      senderNumber: '01819223344',
      amountPaid: 1570,
      verifiedAt: '2026-10-02T14:30:00Z',
      verifiedBy: 'Tanvir (Admin)',
      adminNotes: 'Advance payment verified in bKash statement.'
    },
    timeline: [
      { status: 'PENDING', title: 'Order Placed', timestamp: '2026-10-02T13:45:00Z', actor: 'Samira Rahman' },
      { status: 'PAYMENT_VERIFICATION', title: 'Payment Submitted (bKash TrxID: 9A7K8LM2QP)', timestamp: '2026-10-02T13:48:00Z', actor: 'Samira Rahman' },
      { status: 'PREORDER_CONFIRMED', title: 'Advance Verified & Pre-order Slot Locked (60% Paid)', timestamp: '2026-10-02T14:30:00Z', actor: 'Tanvir (Admin)', note: 'Order sent to batch production.' }
    ],
    createdAt: '2026-10-02T13:45:00Z',
    updatedAt: '2026-10-02T14:30:00Z'
  },
  {
    id: 'ord-102',
    orderNumber: 'TB-2026-000102',
    customerId: 'cust-2',
    customerName: 'Ayesha Siddiqua',
    customerEmail: 'ayesha.s@outlook.com',
    customerPhone: '01711-987654',
    shippingAddress: {
      fullName: 'Ayesha Siddiqua',
      phone: '01711-987654',
      email: 'ayesha.s@outlook.com',
      addressLine: 'Apt 5B, Rose Tower, GEC Circle',
      area: 'Nasirabad',
      city: 'Chattogram',
      district: 'Chattogram',
      postalCode: '4000'
    },
    items: [
      {
        id: 'oi-2',
        productId: 'prod-lipstick-keychain',
        productName: 'Quilted Lipstick Holder Keychain',
        productImage: '/src/assets/images/lipstick_keychain_1791153799684.jpg',
        variantId: 'v-lip-blush',
        variantName: 'Blush Pink',
        unitPrice: 750,
        quantity: 2,
        isPreorder: false,
        advancePercentage: 0,
        advanceRequired: 0,
        itemTotal: 1500
      }
    ],
    subtotal: 1500,
    discount: 150,
    couponCode: 'TRENDY10',
    shippingFee: 130,
    shippingZone: 'Outside Dhaka',
    totalAmount: 1480,
    hasPreorderItems: false,
    advanceAmountRequired: 0,
    advancePaid: 1480,
    remainingBalance: 0,
    orderStatus: 'SHIPPED',
    paymentStatus: 'PAID',
    paymentMethod: 'NAGAD',
    paymentDetails: {
      method: 'NAGAD',
      transactionId: 'NGD8841029',
      senderNumber: '01711987654',
      amountPaid: 1480,
      verifiedAt: '2026-10-03T11:00:00Z',
      verifiedBy: 'Tanvir (Admin)'
    },
    trackingNumber: 'STEADFAST-998821',
    courier: 'Steadfast Courier',
    timeline: [
      { status: 'PENDING', title: 'Order Placed', timestamp: '2026-10-03T10:15:00Z', actor: 'Ayesha Siddiqua' },
      { status: 'CONFIRMED', title: 'Payment Verified (Nagad)', timestamp: '2026-10-03T11:00:00Z', actor: 'Tanvir (Admin)' },
      { status: 'PROCESSING', title: 'Packed at Sorting Hub', timestamp: '2026-10-03T16:00:00Z', actor: 'Inventory Team' },
      { status: 'SHIPPED', title: 'Handed to Steadfast Courier (Tracking: STEADFAST-998821)', timestamp: '2026-10-04T09:30:00Z', actor: 'Tanvir (Admin)' }
    ],
    createdAt: '2026-10-03T10:15:00Z',
    updatedAt: '2026-10-04T09:30:00Z'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'cust-1',
    name: 'Samira Rahman',
    email: 'samira.r@gmail.com',
    phone: '01819-223344',
    address: {
      fullName: 'Samira Rahman',
      phone: '01819-223344',
      email: 'samira.r@gmail.com',
      addressLine: 'House 42, Road 11, Block D',
      area: 'Banani',
      city: 'Dhaka',
      district: 'Dhaka',
      postalCode: '1213'
    },
    totalOrders: 1,
    totalSpent: 2570,
    outstandingBalance: 1000,
    tags: ['Preorder Customer', 'Instagram Lead'],
    notes: 'Ordered Retro MP3 Player. 60% advance paid.',
    createdAt: '2026-10-02T13:45:00Z',
    lastOrderDate: '2026-10-02T13:45:00Z'
  },
  {
    id: 'cust-2',
    name: 'Ayesha Siddiqua',
    email: 'ayesha.s@outlook.com',
    phone: '01711-987654',
    address: {
      fullName: 'Ayesha Siddiqua',
      phone: '01711-987654',
      email: 'ayesha.s@outlook.com',
      addressLine: 'Apt 5B, Rose Tower, GEC Circle',
      area: 'Nasirabad',
      city: 'Chattogram',
      district: 'Chattogram',
      postalCode: '4000'
    },
    totalOrders: 1,
    totalSpent: 1480,
    outstandingBalance: 0,
    tags: ['Repeat Buyer', 'VIP'],
    notes: 'Frequent buyer from Chattogram.',
    createdAt: '2026-10-03T10:15:00Z',
    lastOrderDate: '2026-10-03T10:15:00Z'
  },
  {
    id: 'cust-3',
    name: 'Nabila Chowdhury',
    email: 'nabila.c@gmail.com',
    phone: '01912-334455',
    totalOrders: 2,
    totalSpent: 8900,
    outstandingBalance: 0,
    tags: ['VIP', 'High Value'],
    notes: 'Loving the aesthetic accessories line.',
    createdAt: '2026-09-15T08:00:00Z',
    lastOrderDate: '2026-09-28T14:00:00Z'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    productId: 'prod-lipstick-keychain',
    productName: 'Quilted Lipstick Holder Keychain',
    customerName: 'Ayesha S.',
    customerEmail: 'ayesha.s@outlook.com',
    rating: 5,
    comment: 'The quality of the vegan leather and gold clip is so much better than I expected! Fits my Mac and Dior lipsticks like a dream. Already getting compliments from everyone at uni! 💕',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    isFeatured: true,
    createdAt: '2026-10-01T15:20:00Z'
  },
  {
    id: 'rev-2',
    productId: 'prod-heels-crystal',
    productName: 'Crystal Strap Pointed Kitten Heels',
    customerName: 'Tasnim J.',
    customerEmail: 'tasnim.j@gmail.com',
    rating: 5,
    comment: 'I ordered during the previous batch and they are STUNNING. The heel height is super comfortable for weddings and the crystal sparkle is pure luxury. Trendy & Bendy packaging was 10/10.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    isFeatured: true,
    createdAt: '2026-09-29T18:10:00Z'
  },
  {
    id: 'rev-3',
    productId: 'prod-mp3-retro',
    productName: 'Retro Portable MP3 Player',
    customerName: 'Fariha M.',
    customerEmail: 'fariha.m@yahoo.com',
    rating: 5,
    comment: 'The nostalgic click sound and sound quality are unreal! So happy I secured a pre-order slot. Smooth advance payment experience too.',
    isVerifiedPurchase: true,
    status: 'APPROVED',
    isFeatured: true,
    createdAt: '2026-10-03T11:40:00Z'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-1',
    actorId: 'admin-1',
    actorName: 'Tanvir (Super Admin)',
    action: 'CONFIRM_PREORDER',
    entity: 'Order',
    entityId: 'TB-2026-000101',
    oldValue: 'PAYMENT_VERIFICATION',
    newValue: 'PREORDER_CONFIRMED',
    timestamp: '2026-10-02T14:30:00Z'
  },
  {
    id: 'aud-2',
    actorId: 'admin-1',
    actorName: 'Tanvir (Super Admin)',
    action: 'UPDATE_ORDER_STATUS',
    entity: 'Order',
    entityId: 'TB-2026-000102',
    oldValue: 'PROCESSING',
    newValue: 'SHIPPED',
    timestamp: '2026-10-04T09:30:00Z'
  }
];

export const INITIAL_USERS: User[] = [
  {
    id: 'usr-admin-1',
    name: 'Tanvir Ahmed',
    email: 'tanvir088033@gmail.com',
    phone: '01712-345678',
    role: 'SUPER_ADMIN',
    avatarUrl: '',
    createdAt: '2026-01-01T00:00:00Z'
  },
  {
    id: 'usr-manager-1',
    name: 'Sarah Khan',
    email: 'sarah.orders@trendybendy.com',
    phone: '01911-001122',
    role: 'ORDER_MANAGER',
    createdAt: '2026-06-15T00:00:00Z'
  },
  {
    id: 'usr-customer-1',
    name: 'Samira Rahman',
    email: 'samira.r@gmail.com',
    phone: '01819-223344',
    role: 'CUSTOMER',
    createdAt: '2026-10-02T13:45:00Z'
  }
];
