# Trendy & Bendy – Social-Commerce Storefront & Pre-Order Engine

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A complete, production-ready e-commerce platform and pre-order management engine designed for **Trendy & Bendy** ([@trendy_.and_.bendy](https://www.instagram.com/trendy_.and_.bendy/)).

Transforms Instagram social-commerce selling into a streamlined online storefront with partial advance payments, live batch countdowns, automated or manual TrxID verification, and a comprehensive administrative control center.

---

## ✨ Key Features

### 🛒 1. Customer Storefront
- **Instagram-First Aesthetic**: Tailored for mobile and desktop shoppers with an editorial serif header, warm ivory palette, and clean typography.
- **Top Bar Contract**: Brand wordmark, clean single-line navigation links (*Shop All, Pre-Order, Gadgets, Shoes, Accessories, Instagram*), and interactive utility actions (*Search, Wishlist, Account, Cart badge*).
- **Contiguous Purchase Module (PDP)**:
  - Sticky image gallery with thumbnail switcher.
  - Variant selectors (Colors with color swatches, Sizes, Models).
  - Dynamic Pre-Order Breakdown Box: Displays advance deposit required now (e.g., 60%), remaining balance due upon batch arrival in Dhaka (40%), and estimated delivery window (35–45 days after close).
  - Live batch closing countdown timer.
  - Quick "Add to Bag", "Instant Checkout", and Wishlist toggle.
  - Verified customer reviews with star rating breakdown and review submission modal.
- **Cart Drawer & Checkout**:
  - Slide-out cart drawer showing itemized breakdown, quantity steppers, and pre-order deposit calculation.
  - Delivery zones for Bangladesh (*Inside Dhaka ৳70, Outside Dhaka ৳130, Express ৳160*) with free shipping threshold support.
  - Server-side deterministic price, coupon, and advance payment recalculations.
- **Order Tracking & Account**:
  - Real-time order progress timeline (*Order Placed → Payment Verification → Pre-Order Confirmed → Processing → In Transit with Courier ID → Delivered*).
  - Outstanding balance viewer with self-service **"Pay Remaining Balance"** modal.
  - Order lookup by Order ID (e.g. `TB-2026-000101`) or customer phone/email.
  - Customer profile, saved delivery addresses, and wishlist.

---

### 💳 2. Payment Abstraction & Optional Gateway Integration
- **Optional Online Gateways**:
  - Designed with adapters for **bKash**, **Nagad**, and **SSLCommerz**.
  - All gateway API variables are **completely optional**.
- **Automatic Manual TrxID Fallback**:
  - When gateway API variables are not set in the environment, the system **automatically and gracefully defaults to Manual TrxID Mode**.
  - Displays the business merchant/personal account number with a one-click **"Copy Number"** button.
  - Shows exact advance payment amount required.
  - Provides customer input fields for **Transaction ID (`TrxID`)** and **Sender Phone Number**.
  - Enters the order into the Admin **Payment Verification Queue** for staff review.
- **Cash on Delivery (COD)**:
  - Supported for in-stock orders.
  - Automatically disabled when pre-order items are in the cart with a clear explanation to customers.

---

### 🛡️ 3. Administrative Operations Panel
- **Role-Based Access Control (RBAC)**:
  - Supports `SUPER_ADMIN`, `ORDER_MANAGER`, `INVENTORY_MANAGER`, `CONTENT_MANAGER`, and `CUSTOMER_SUPPORT`.
  - Built-in staff role switcher for testing each operational persona.
- **Operations Dashboard**:
  - Real-time KPIs: Collected Advance Revenue, Outstanding Balances, Total Orders, Active Pre-Orders, Customers CRM, Low-Stock watchlist.
  - One-click **Payment Verification Queue**.
- **Order Management**:
  - Filter orders by status (*Pending, Verification, Confirmed, Shipped, Delivered, Cancelled*) or type (*Pre-Order vs In-Stock*).
  - Assign courier partner and tracking numbers (*Steadfast / Pathao / eCourier*).
  - Record remaining balance payments and process refunds.
  - Export filtered order lists to CSV.
- **Pre-Order Command Center**:
  - Monitor batch closing deadlines, reserved slots, and advance collected.
  - Extend closing deadlines or lock batches.
  - Export pre-order fulfillment manifests.
- **Catalog & Inventory Control**:
  - Product creation and editing with variants, pricing, pre-order settings, and image URLs.
  - Real-time inventory tracking with stock movement audit logs (*Stock In, Stock Out, Reserved, Return, Damaged*).
- **CMS & Store Settings**:
  - Manage announcement bar text and hero banner copy/imagery.
  - Customize bKash and Nagad account numbers, delivery rates, and store policies.
  - Searchable security audit log tracking all staff actions.

---

### 🗄️ 4. Database Architecture
A production-grade PostgreSQL / Supabase DDL schema file is included in `src/db/schema.sql`, featuring 38+ normalized relational tables:
- `users`, `roles`, `permissions`, `customers`, `addresses`
- `products`, `product_variants`, `product_images`, `categories`
- `preorders`, `inventory_movements`
- `orders`, `order_items`, `order_status_history`
- `payment_transactions`, `refunds`, `coupons`
- `wishlists`, `reviews`, `shipping_zones`, `audit_logs`, `contact_messages`

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/your-username/trendy-and-bendy.git
cd trendy-and-bendy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(All gateway API keys are optional. When omitted, the store defaults to Manual TrxID mode).*

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Build for Production

```bash
npm run build
```
The optimized production bundle will be generated in the `dist/` directory.

To preview the production build locally:
```bash
npm run preview
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Required? |
|---|---|---|
| `APP_URL` | Public URL where the application is hosted | Optional |
| `GEMINI_API_KEY` | Gemini API Key for server-side AI integrations | Optional |
| `VITE_BKASH_APP_KEY` | bKash Merchant App Key | Optional (Falls back to manual TrxID) |
| `VITE_BKASH_APP_SECRET` | bKash Merchant App Secret | Optional (Falls back to manual TrxID) |
| `VITE_NAGAD_MERCHANT_ID` | Nagad Merchant ID | Optional (Falls back to manual TrxID) |
| `VITE_NAGAD_PUBLIC_KEY` | Nagad Public Key | Optional (Falls back to manual TrxID) |
| `VITE_SSLCOMMERZ_STORE_ID` | SSLCommerz Store ID | Optional (Falls back to manual TrxID) |
| `VITE_SSLCOMMERZ_STORE_PASS` | SSLCommerz Store Password | Optional (Falls back to manual TrxID) |
| `DATABASE_URL` | PostgreSQL connection string (Supabase / RDS) | Optional for backend migration |

---

## 📦 Deployment

### Deploy to Vercel
1. Push your repository to GitHub.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**.
4. Set Build Command: `npm run build` and Output Directory: `dist`.
5. Click **Deploy**.

### Deploy to Netlify
1. Connect your GitHub repository to [Netlify](https://www.netlify.com).
2. Build command: `npm run build`.
3. Publish directory: `dist`.
4. Deploy site.

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
