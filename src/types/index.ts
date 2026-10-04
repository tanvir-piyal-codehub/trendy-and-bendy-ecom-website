export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'ORDER_MANAGER' 
  | 'INVENTORY_MANAGER' 
  | 'CONTENT_MANAGER' 
  | 'CUSTOMER_SUPPORT' 
  | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
}

export type ProductStatus = 'IN_STOCK' | 'PRE_ORDER' | 'COMING_SOON' | 'SOLD_OUT' | 'HIDDEN';

export interface ProductVariant {
  id: string;
  sku: string;
  name: string; // e.g. "Lilac / 38"
  color?: string;
  size?: string;
  model?: string;
  priceAdjustment: number;
  stock: number;
  image?: string;
  isActive: boolean;
}

export interface PreorderSettings {
  isPreorder: boolean;
  openingDate: string;
  closingDate: string;
  estimatedDeliveryMinDays: number;
  estimatedDeliveryMaxDays: number;
  advancePercentage: number; // e.g. 60 for 60%
  maxQuantity?: number;
  currentPreorderQuantity: number;
  preorderStatus: 'OPEN' | 'CLOSED' | 'EXTENDED' | 'FULFILLED';
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  brand: string;
  category: string;
  subcategory?: string;
  tags: string[];
  status: ProductStatus;
  productType: 'SIMPLE' | 'VARIABLE' | 'PREORDER';
  costPrice: number;
  regularPrice: number;
  salePrice?: number;
  currency: string;
  stockQuantity: number;
  reservedStock: number;
  lowStockThreshold: number;
  images: Array<{ url: string; alt: string; isMain?: boolean }>;
  videoUrl?: string;
  variants: ProductVariant[];
  preorderSettings?: PreorderSettings;
  instagramPostUrl?: string;
  instagramCaption?: string;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  itemCount?: number;
  isActive: boolean;
}

export type InventoryMovementType = 
  | 'STOCK_IN' 
  | 'STOCK_OUT' 
  | 'RESERVED' 
  | 'RELEASED' 
  | 'DAMAGE' 
  | 'RETURN';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  type: InventoryMovementType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  actor: string;
  timestamp: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_VERIFICATION'
  | 'CONFIRMED'
  | 'PREORDER_CONFIRMED'
  | 'PROCESSING'
  | 'READY_TO_SHIP'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'VERIFICATION_REQUIRED'
  | 'FAILED'
  | 'REFUNDED';

export type PaymentMethod =
  | 'BKASH'
  | 'NAGAD'
  | 'ROCKET'
  | 'SSLCOMMERZ'
  | 'CARD'
  | 'BANK_TRANSFER'
  | 'COD';

export interface ShippingAddress {
  fullName: string;
  phone: string;
  email: string;
  addressLine: string;
  area: string;
  city: string;
  district: string;
  postalCode?: string;
  deliveryNotes?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  variantId?: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  isPreorder: boolean;
  advancePercentage: number;
  advanceRequired: number;
  itemTotal: number;
}

export interface OrderTimelineEvent {
  status: OrderStatus;
  title: string;
  timestamp: string;
  actor: string;
  note?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  transactionId?: string;
  senderNumber?: string;
  bankReference?: string;
  paymentProofUrl?: string;
  amountPaid: number;
  verifiedAt?: string;
  verifiedBy?: string;
  adminNotes?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. TB-2026-000101
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  couponCode?: string;
  shippingFee: number;
  shippingZone: string;
  totalAmount: number;
  hasPreorderItems: boolean;
  advanceAmountRequired: number;
  advancePaid: number;
  remainingBalance: number;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDetails: PaymentDetails;
  timeline: OrderTimelineEvent[];
  trackingNumber?: string;
  courier?: string;
  customerNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  type: 'ADVANCE' | 'REMAINING' | 'FULL' | 'REFUND';
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
  senderNumber?: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  proofUrl?: string;
  notes?: string;
  verifiedBy?: string;
  createdAt: string;
}

export interface Refund {
  id: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  reason: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  processedBy?: string;
  createdAt: string;
}

export type DiscountType = 'PERCENTAGE' | 'FIXED' | 'FREE_SHIPPING';

export interface Coupon {
  id: string;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
  applicableCategories?: string[];
  applicableProducts?: string[];
}

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  isFeatured: boolean;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: ShippingAddress;
  totalOrders: number;
  totalSpent: number;
  outstandingBalance: number;
  tags: string[];
  notes?: string;
  createdAt: string;
  lastOrderDate?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  orderNumber?: string;
  subject: string;
  message: string;
  status: 'UNREAD' | 'READ' | 'REPLIED';
  adminReply?: string;
  createdAt: string;
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
  ipAddress?: string;
}

export interface ShippingZone {
  id: string;
  name: string;
  rate: number;
  estimatedDays: string;
  freeShippingAbove?: number;
  isActive: boolean;
}

export interface PaymentMethodConfig {
  id: PaymentMethod;
  name: string;
  enabled: boolean;
  accountType: string; // e.g. "Merchant", "Personal", "Agent", "Gateway"
  accountNumber: string;
  instructions: string;
  requiresProof: boolean;
  badge?: string;
  gatewaySupported?: boolean;
  gatewayMode?: 'AUTOMATED_GATEWAY' | 'MANUAL_TRXID';
  envVars?: string[];
}

export interface StoreSettings {
  businessName: string;
  tagline: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  currencySymbol: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  defaultPreorderAdvancePercentage: number;
  defaultEstimatedDeliveryText: string;
  freeShippingThreshold: number;
  announcementBar: {
    enabled: boolean;
    text: string;
    linkText?: string;
    linkUrl?: string;
  };
  heroBanner: {
    heading: string;
    subheading: string;
    buttonText: string;
    buttonUrl: string;
    secondaryButtonText?: string;
    secondaryButtonUrl?: string;
    backgroundImage: string;
    active: boolean;
  };
  shippingZones: ShippingZone[];
  paymentMethods: PaymentMethodConfig[];
  policies: {
    shippingPolicy: string;
    returnPolicy: string;
    preorderPolicy: string;
    paymentPolicy: string;
    termsAndConditions: string;
    privacyPolicy: string;
  };
}

export interface CartItem {
  id: string; // generated cart item id
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  price: number;
}
