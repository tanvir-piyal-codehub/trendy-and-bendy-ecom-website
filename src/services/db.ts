import { 
  Product, 
  Category, 
  StoreSettings, 
  Coupon, 
  Order, 
  Customer, 
  Review, 
  AuditLog, 
  User, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  InventoryMovement,
  ContactMessage,
  NewsletterSubscriber,
  PaymentTransaction,
  Refund
} from '../types';
import { 
  INITIAL_SETTINGS, 
  INITIAL_CATEGORIES, 
  INITIAL_PRODUCTS, 
  INITIAL_COUPONS, 
  INITIAL_ORDERS, 
  INITIAL_CUSTOMERS, 
  INITIAL_REVIEWS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_USERS 
} from './mockData';

const STORAGE_KEYS = {
  SETTINGS: 'tb_store_settings_v1',
  PRODUCTS: 'tb_products_v1',
  CATEGORIES: 'tb_categories_v1',
  ORDERS: 'tb_orders_v1',
  CUSTOMERS: 'tb_customers_v1',
  COUPONS: 'tb_coupons_v1',
  REVIEWS: 'tb_reviews_v1',
  AUDIT_LOGS: 'tb_audit_logs_v1',
  USERS: 'tb_users_v1',
  CURRENT_USER: 'tb_current_user_v1',
  WISHLIST: 'tb_wishlist_v1',
  CART: 'tb_cart_v1',
  MESSAGES: 'tb_contact_messages_v1',
  SUBSCRIBERS: 'tb_subscribers_v1',
  INVENTORY_LOGS: 'tb_inventory_movements_v1'
};

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => {
    try {
      fn();
    } catch (e) {
      console.error('Listener notification error:', e);
    }
  });
}

export function subscribeToStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`Failed to read ${key} from storage:`, e);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyListeners();
  } catch (e) {
    console.error(`Failed to write ${key} to storage:`, e);
  }
}

// ==========================================
// STORE SERVICE APIS
// ==========================================

export const db = {
  // --- Settings ---
  getSettings(): StoreSettings {
    return getStored<StoreSettings>(STORAGE_KEYS.SETTINGS, INITIAL_SETTINGS);
  },
  updateSettings(settings: Partial<StoreSettings>, actorName = 'Admin'): StoreSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    setStored(STORAGE_KEYS.SETTINGS, updated);
    this.addAuditLog(actorName, 'UPDATE_SETTINGS', 'Settings', '1', 'old_settings', 'updated_settings');
    return updated;
  },

  // --- Categories ---
  getCategories(): Category[] {
    return getStored<Category[]>(STORAGE_KEYS.CATEGORIES, INITIAL_CATEGORIES);
  },
  saveCategory(category: Category, actorName = 'Admin'): void {
    const list = this.getCategories();
    const idx = list.findIndex(c => c.id === category.id);
    if (idx >= 0) {
      list[idx] = category;
    } else {
      list.push(category);
    }
    setStored(STORAGE_KEYS.CATEGORIES, list);
    this.addAuditLog(actorName, 'SAVE_CATEGORY', 'Category', category.id);
  },
  deleteCategory(id: string, actorName = 'Admin'): void {
    const list = this.getCategories().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.CATEGORIES, list);
    this.addAuditLog(actorName, 'DELETE_CATEGORY', 'Category', id);
  },

  // --- Products ---
  getProducts(): Product[] {
    return getStored<Product[]>(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS);
  },
  getProductById(id: string): Product | undefined {
    return this.getProducts().find(p => p.id === id);
  },
  getProductBySlug(slug: string): Product | undefined {
    return this.getProducts().find(p => p.slug === slug);
  },
  saveProduct(product: Product, actorName = 'Admin'): void {
    const list = this.getProducts();
    const idx = list.findIndex(p => p.id === product.id);
    const now = new Date().toISOString();
    if (idx >= 0) {
      list[idx] = { ...product, updatedAt: now };
    } else {
      list.unshift({ ...product, createdAt: now, updatedAt: now });
    }
    setStored(STORAGE_KEYS.PRODUCTS, list);
    this.addAuditLog(actorName, idx >= 0 ? 'UPDATE_PRODUCT' : 'CREATE_PRODUCT', 'Product', product.id, '', product.name);
  },
  deleteProduct(id: string, actorName = 'Admin'): void {
    const list = this.getProducts().filter(p => p.id !== id);
    setStored(STORAGE_KEYS.PRODUCTS, list);
    this.addAuditLog(actorName, 'DELETE_PRODUCT', 'Product', id);
  },

  // --- Orders ---
  getOrders(): Order[] {
    return getStored<Order[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
  },
  getOrderById(id: string): Order | undefined {
    return this.getOrders().find(o => o.id === id || o.orderNumber.toUpperCase() === id.toUpperCase());
  },
  createOrder(orderInput: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt' | 'timeline'>): Order {
    const currentOrders = this.getOrders();
    const nextSeq = currentOrders.length + 101;
    const year = new Date().getFullYear();
    const orderNumber = `TB-${year}-${String(nextSeq).padStart(6, '0')}`;
    const id = `ord-${Date.now()}`;
    const now = new Date().toISOString();

    const timeline = [
      {
        status: orderInput.orderStatus,
        title: 'Order Placed',
        timestamp: now,
        actor: orderInput.customerName
      }
    ];

    if (orderInput.paymentDetails.transactionId) {
      timeline.push({
        status: 'PAYMENT_VERIFICATION',
        title: `Payment Submitted (${orderInput.paymentMethod} TrxID: ${orderInput.paymentDetails.transactionId})`,
        timestamp: now,
        actor: orderInput.customerName
      });
    }

    const newOrder: Order = {
      ...orderInput,
      id,
      orderNumber,
      timeline,
      createdAt: now,
      updatedAt: now
    };

    currentOrders.unshift(newOrder);
    setStored(STORAGE_KEYS.ORDERS, currentOrders);

    // Update customer CRM or create new
    this.recordCustomerOrder(newOrder);

    // If order has preorder items, increment preorder quantity
    if (newOrder.hasPreorderItems) {
      newOrder.items.forEach(item => {
        if (item.isPreorder) {
          const product = this.getProductById(item.productId);
          if (product && product.preorderSettings) {
            product.preorderSettings.currentPreorderQuantity += item.quantity;
            this.saveProduct(product, 'System (Pre-order Engine)');
          }
        }
      });
    }

    this.addAuditLog('Customer', 'PLACE_ORDER', 'Order', orderNumber, '', `Total: ৳${newOrder.totalAmount}`);
    return newOrder;
  },

  updateOrderStatus(orderId: string, status: OrderStatus, actorName = 'Admin', note?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    const oldStatus = order.orderStatus;
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();

    const titleMap: Record<OrderStatus, string> = {
      PENDING: 'Order Pending',
      PAYMENT_PENDING: 'Payment Pending',
      PAYMENT_VERIFICATION: 'Payment Under Review',
      CONFIRMED: 'Order Confirmed',
      PREORDER_CONFIRMED: 'Pre-order Confirmed & Slot Locked',
      PROCESSING: 'Processing & Packaging',
      READY_TO_SHIP: 'Ready for Dispatch',
      SHIPPED: 'Dispatched to Courier',
      OUT_FOR_DELIVERY: 'Out for Delivery',
      DELIVERED: 'Delivered to Customer',
      CANCELLED: 'Order Cancelled',
      REFUNDED: 'Order Refunded'
    };

    order.timeline.push({
      status,
      title: titleMap[status] || status,
      timestamp: new Date().toISOString(),
      actor: actorName,
      note
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    this.addAuditLog(actorName, 'UPDATE_ORDER_STATUS', 'Order', order.orderNumber, oldStatus, status);
    return order;
  },

  verifyPayment(orderId: string, verifiedAmount: number, actorName = 'Admin', notes?: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.advancePaid = (order.advancePaid || 0) + verifiedAmount;
    order.remainingBalance = Math.max(0, order.totalAmount - order.advancePaid);

    if (order.remainingBalance === 0) {
      order.paymentStatus = 'PAID';
      order.orderStatus = order.hasPreorderItems ? 'PREORDER_CONFIRMED' : 'CONFIRMED';
    } else {
      order.paymentStatus = 'PARTIALLY_PAID';
      order.orderStatus = order.hasPreorderItems ? 'PREORDER_CONFIRMED' : 'CONFIRMED';
    }

    order.paymentDetails.verifiedAt = new Date().toISOString();
    order.paymentDetails.verifiedBy = actorName;
    if (notes) order.paymentDetails.adminNotes = notes;

    order.timeline.push({
      status: order.orderStatus,
      title: `Payment Verified (৳${verifiedAmount.toLocaleString()})`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      note: notes || `Verified by ${actorName}. Remaining balance: ৳${order.remainingBalance.toLocaleString()}`
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    this.addAuditLog(actorName, 'VERIFY_PAYMENT', 'Order', order.orderNumber, 'VERIFICATION_REQUIRED', `Paid: ৳${verifiedAmount}`);
    return order;
  },

  recordRemainingPayment(orderId: string, amount: number, method: PaymentMethod, trxId?: string, actorName = 'Admin'): Order | null {
    const orders = this.getOrders();
    const order = orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) return null;

    order.advancePaid += amount;
    order.remainingBalance = Math.max(0, order.totalAmount - order.advancePaid);
    if (order.remainingBalance === 0) {
      order.paymentStatus = 'PAID';
    }

    order.timeline.push({
      status: order.orderStatus,
      title: `Final Balance Payment (৳${amount.toLocaleString()} via ${method} TrxID: ${trxId || 'N/A'})`,
      timestamp: new Date().toISOString(),
      actor: actorName,
      note: `Remaining balance settled. Order is now fully paid.`
    });

    setStored(STORAGE_KEYS.ORDERS, orders);
    this.addAuditLog(actorName, 'RECORD_BALANCE_PAYMENT', 'Order', order.orderNumber, '', `Amount: ৳${amount}`);
    return order;
  },

  // --- Customers CRM ---
  getCustomers(): Customer[] {
    return getStored<Customer[]>(STORAGE_KEYS.CUSTOMERS, INITIAL_CUSTOMERS);
  },
  recordCustomerOrder(order: Order): void {
    const customers = this.getCustomers();
    let customer = customers.find(c => c.email.toLowerCase() === order.customerEmail.toLowerCase() || c.phone === order.customerPhone);
    const now = new Date().toISOString();

    if (customer) {
      customer.totalOrders += 1;
      customer.totalSpent += order.totalAmount;
      customer.outstandingBalance += order.remainingBalance;
      customer.lastOrderDate = now;
      if (order.hasPreorderItems && !customer.tags.includes('Preorder Customer')) {
        customer.tags.push('Preorder Customer');
      }
      if (customer.totalOrders > 2 && !customer.tags.includes('Repeat Buyer')) {
        customer.tags.push('Repeat Buyer');
      }
    } else {
      customer = {
        id: `cust-${Date.now()}`,
        name: order.customerName,
        email: order.customerEmail,
        phone: order.customerPhone,
        address: order.shippingAddress,
        totalOrders: 1,
        totalSpent: order.totalAmount,
        outstandingBalance: order.remainingBalance,
        tags: order.hasPreorderItems ? ['New Customer', 'Preorder Customer'] : ['New Customer'],
        createdAt: now,
        lastOrderDate: now
      };
      customers.unshift(customer);
    }
    setStored(STORAGE_KEYS.CUSTOMERS, customers);
  },
  updateCustomer(customer: Customer, actorName = 'Admin'): void {
    const list = this.getCustomers();
    const idx = list.findIndex(c => c.id === customer.id);
    if (idx >= 0) {
      list[idx] = customer;
      setStored(STORAGE_KEYS.CUSTOMERS, list);
      this.addAuditLog(actorName, 'UPDATE_CUSTOMER', 'Customer', customer.id, '', customer.name);
    }
  },

  // --- Coupons ---
  getCoupons(): Coupon[] {
    return getStored<Coupon[]>(STORAGE_KEYS.COUPONS, INITIAL_COUPONS);
  },
  validateCoupon(code: string, subtotal: number): { valid: boolean; coupon?: Coupon; discountAmount: number; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.getCoupons().find(c => c.code.toUpperCase() === cleanCode);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid coupon code.' };
    }
    if (!coupon.isActive) {
      return { valid: false, discountAmount: 0, message: 'This coupon is no longer active.' };
    }
    if (subtotal < coupon.minOrderValue) {
      return { 
        valid: false, 
        discountAmount: 0, 
        message: `Minimum order value of ৳${coupon.minOrderValue.toLocaleString()} required for this coupon.` 
      };
    }
    const now = new Date();
    if (new Date(coupon.endDate) < now) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired.' };
    }
    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discountAmount: 0, message: 'This coupon has reached its usage limit.' };
    }

    let discountAmount = 0;
    if (coupon.discountType === 'PERCENTAGE') {
      discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else if (coupon.discountType === 'FIXED') {
      discountAmount = coupon.discountValue;
    } else if (coupon.discountType === 'FREE_SHIPPING') {
      discountAmount = 70; // Inside Dhaka standard shipping rebate
    }

    return {
      valid: true,
      coupon,
      discountAmount: Math.min(discountAmount, subtotal),
      message: `Coupon applied: ${coupon.code} (-৳${discountAmount.toLocaleString()})`
    };
  },
  saveCoupon(coupon: Coupon, actorName = 'Admin'): void {
    const list = this.getCoupons();
    const idx = list.findIndex(c => c.id === coupon.id);
    if (idx >= 0) {
      list[idx] = coupon;
    } else {
      list.push(coupon);
    }
    setStored(STORAGE_KEYS.COUPONS, list);
    this.addAuditLog(actorName, 'SAVE_COUPON', 'Coupon', coupon.code);
  },
  deleteCoupon(id: string, actorName = 'Admin'): void {
    const list = this.getCoupons().filter(c => c.id !== id);
    setStored(STORAGE_KEYS.COUPONS, list);
    this.addAuditLog(actorName, 'DELETE_COUPON', 'Coupon', id);
  },

  // --- Reviews ---
  getReviews(): Review[] {
    return getStored<Review[]>(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);
  },
  getProductReviews(productId: string): Review[] {
    return this.getReviews().filter(r => r.productId === productId && r.status === 'APPROVED');
  },
  addReview(review: Omit<Review, 'id' | 'createdAt'>): Review {
    const reviews = this.getReviews();
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    reviews.unshift(newRev);
    setStored(STORAGE_KEYS.REVIEWS, reviews);
    return newRev;
  },
  updateReviewStatus(id: string, status: 'APPROVED' | 'REJECTED' | 'PENDING', actorName = 'Admin'): void {
    const reviews = this.getReviews();
    const rev = reviews.find(r => r.id === id);
    if (rev) {
      rev.status = status;
      setStored(STORAGE_KEYS.REVIEWS, reviews);
      this.addAuditLog(actorName, 'UPDATE_REVIEW_STATUS', 'Review', id, '', status);
    }
  },

  // --- Messages & Newsletter ---
  getContactMessages(): ContactMessage[] {
    return getStored<ContactMessage[]>(STORAGE_KEYS.MESSAGES, [
      {
        id: 'msg-1',
        name: 'Sadia Jahan',
        email: 'sadia.j@gmail.com',
        phone: '01715-443322',
        orderNumber: 'TB-2026-000101',
        subject: 'Inquiry regarding batch shipping date',
        message: 'Hello Trendy & Bendy! I placed the pre-order for the retro MP3 player. Just wanted to double check if delivery will be within 35 days? Love your brand!',
        status: 'UNREAD',
        createdAt: '2026-10-03T16:00:00Z'
      }
    ]);
  },
  saveContactMessage(msg: Omit<ContactMessage, 'id' | 'status' | 'createdAt'>): ContactMessage {
    const list = this.getContactMessages();
    const newMsg: ContactMessage = {
      ...msg,
      id: `msg-${Date.now()}`,
      status: 'UNREAD',
      createdAt: new Date().toISOString()
    };
    list.unshift(newMsg);
    setStored(STORAGE_KEYS.MESSAGES, list);
    return newMsg;
  },
  replyContactMessage(id: string, replyText: string, actorName = 'Admin'): void {
    const list = this.getContactMessages();
    const msg = list.find(m => m.id === id);
    if (msg) {
      msg.status = 'REPLIED';
      msg.adminReply = replyText;
      setStored(STORAGE_KEYS.MESSAGES, list);
      this.addAuditLog(actorName, 'REPLY_MESSAGE', 'ContactMessage', id);
    }
  },
  subscribeNewsletter(email: string): boolean {
    const list = getStored<NewsletterSubscriber[]>(STORAGE_KEYS.SUBSCRIBERS, []);
    if (list.some(s => s.email.toLowerCase() === email.toLowerCase())) {
      return false;
    }
    list.push({
      id: `sub-${Date.now()}`,
      email,
      subscribedAt: new Date().toISOString(),
      isActive: true
    });
    setStored(STORAGE_KEYS.SUBSCRIBERS, list);
    return true;
  },

  // --- Wishlist & Cart Persistence ---
  getWishlist(): string[] {
    return getStored<string[]>(STORAGE_KEYS.WISHLIST, ['prod-mp3-retro', 'prod-lipstick-keychain']);
  },
  toggleWishlist(productId: string): boolean {
    const list = this.getWishlist();
    const idx = list.indexOf(productId);
    let added = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(productId);
      added = true;
    }
    setStored(STORAGE_KEYS.WISHLIST, list);
    return added;
  },

  // --- Audit Logs ---
  getAuditLogs(): AuditLog[] {
    return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  },
  addAuditLog(actorName: string, action: string, entity: string, entityId: string, oldValue = '', newValue = ''): void {
    const logs = this.getAuditLogs();
    logs.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      actorId: 'usr-admin',
      actorName,
      action,
      entity,
      entityId,
      oldValue,
      newValue,
      timestamp: new Date().toISOString()
    });
    // keep max 200 logs
    if (logs.length > 200) logs.pop();
    setStored(STORAGE_KEYS.AUDIT_LOGS, logs);
  },

  // --- Users & Roles ---
  getUsers(): User[] {
    return getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  },
  getCurrentUser(): User {
    return getStored<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]); // default to Super Admin for seamless testing
  },
  setCurrentUser(user: User): void {
    setStored(STORAGE_KEYS.CURRENT_USER, user);
  },

  // --- Reset to Initial Seed ---
  resetToSeed(): void {
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    localStorage.removeItem(STORAGE_KEYS.CUSTOMERS);
    localStorage.removeItem(STORAGE_KEYS.COUPONS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGES);
    notifyListeners();
  }
};
