# MifimnPay 🧾

**The Professional Receipt Generator for Small Businesses.**

MifimnPay is a modern, mobile-first web application built with **Next.js** and **TypeScript**. It helps small business owners, logistics companies, and freelancers generate authentic, professional payment receipts (styled like OPay/Bank transfer receipts) instantly.

![Project Banner](public/og-image.png)
*(Note: Replace this with a screenshot of your landing page or generator)*

## 🚀 Features

### Core Functionality
- **Instant Generation:** Create receipts in real-time with a live preview.
- **OPay-Style Design:** Authentic "Ticket" layout with zig-zag bottom edges and crisp typography.
- **Customization:**
  - Toggle Business Logo.
  - Switch between "Simple" and "Detailed" views.
  - Choose from 8+ professional brand colors.
- **Smart Export:**
  - **Download:** High-resolution PNG export.
  - **WhatsApp Share:** Native integration to share receipts directly to customers.

### User Experience (UX)
- **Mobile-First Architecture:** Designed to feel like a native app on phones (`100dvh` support).
- **Guest vs. Pro Modes:** - Guests can generate previews but must sign up to download/share.
  - "Anti-Screenshot" watermarks protect premium features in guest mode.
- **Confirmation Flow:** Safety modal before downloading to ensure details are correct.
- **Interactive Landing Page:** Virtual phone demo showing the generation process.

### Dashboard & Management
- **History Tracking:** Searchable list of past transactions with status filters (Paid/Pending).
- **Business Profile:** Save default business details (Name, Phone, Logo, Footer Message).

## 🛠️ Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Image Generation:** [html2canvas](https://html2canvas.hertzen.com/)

## 📦 Getting Started

Follow these steps to run the project locally.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/yourusername/MifimnPay.git](https://github.com/yourusername/MifimnPay.git)
   cd MifimnPay
