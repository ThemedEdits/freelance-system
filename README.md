# Themed Edits • Modern Client Management & Invoicing System

A modern, high-performance, dark-themed glassmorphic client management and invoice generation platform engineered specifically for **Themed Edits** (Graphic Design, Website Development, and Software Engineering).

![Themed Edits](public/logo.png)

---

## Key Features

### 1. Complex Billing Models & Multi-Service Categorization
- **Major Service Divisions**: Clean filtering and management across:
  - Graphic Design (Social media graphics, branding, carousels, reels)
  - Website Development (Landing pages, web applications, portals)
  - Software Engineering (Custom APIs, databases, cloud architecture)
- **Flexible Client Models**:
  - **Monthly Retainers**: Fixed monthly agreements with individual cycle reset dates (e.g., 1st, 6th, 18th, 21st of each month).
  - **Per-Project Clients**: Dynamic line-item billing based on deliverable counts and per-item pricing.
  - **Hybrid Clients**: Monthly retainer clients who also commission extra projects outside their regular monthly retainer.

### 2. Posts & Deliverables Calculator
- Add and calculate multiple post/asset types with custom rates (e.g., Carousel Posts, Single Feed Graphics, Reels/Motion, Story Packs, UI Screens, Feature APIs).
- Interactive quantity steppers and live line-item calculations (`Quantity × Unit Price = Total`).
- Add deliverables and posts anytime as project scopes expand.
- Configurable discounts (fixed amount in PKR or percentage `%`).

### 3. Automated Monthly Cycle Detection & Reset Notifications
- Calculates client cycle periods dynamically based on their specific reset day (e.g. `Oct 18 – Nov 17` when reset day is 18).
- Automatically triggers notifications in the Notifications Center when a client's monthly cycle resets and payment is due.
- Comprehensive payment status tracking:
  - **Paid Complete**
  - **Late Paid** (records exact date payment was received and computes `days_late`)
  - **Paid Partial** (tracks amount received and remaining balance due)
  - **Unpaid / Due**

### 4. Branded Invoicing Engine
- Generates official invoices **Per Project** or **Consolidated Per Client**.
- **Interactive Toggles**:
  - **Itemized Post Breakdown vs. Summary Mode**: Switch between detailed deliverable breakdowns or a minimalist summary view (project name, total, and due date).
  - **Monthly Retainer Inclusion**: Optionally append monthly retainer fees to consolidated invoices.
  - **Bank & EasyPaisa Details**: Automatically embeds Meezan Bank and EasyPaisa account details at the footer so clients never have to ask repeatedly.
- Fixed header with official company logo and firm contact details.
- Fixed footer featuring all social handles:
  - **Instagram**: `themed.edits.te`
  - **Email**: `themed.edits.co@gmail.com`
  - **WhatsApp**: `03323954620`
- Print & PDF export ready with dedicated high-contrast print stylesheets.

### 5. Advanced Analytics & Client Reliability Radar
- **Financial Counters**: Total lifetime earnings, earned this month, pending balances due, average monthly retainer run-rate.
- **Client Payment Discipline**: Tracks average days late and classifies client reliability (Prompt On-Time Payers vs. Frequently Late Clients).

### 6. Custom Design & Animations
- Glassmorphic luxury dark aesthetic with subtle glows and refined borders.
- Strictly no italic fonts; clean typography with `Inter` and system sans-serif.
- Custom form controls: floating label inputs, custom selects, toggles, checkboxes, number steppers, and date pickers.
- Animated stats counters, loading skeletons, and smooth slide-in modals.
- Fully responsive with mobile navigation drawer.

---

## Database Configuration (Turso Cloud libSQL)

This application is powered by Turso cloud database.

### Environment Variables
Create `.env.local` in the project root:

```env
TURSO_DATABASE_URL=libsql://freelance-system-themededits.aws-ap-south-1.turso.io
TURSO_AUTH_TOKEN=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3OTM4NDQ0MzYsImlkIjoiMDFhMWE5NzUtNzIwMS03OGIxLThmOTctOWIyODQwODZmMzQzIiwia2lkIjoiWGM3NEJHcF9fT19tcldpaXAtYUUtd0NzdVF3S0dRTFM0Sm5hWmF1b3J0WSIsInJpZCI6IjBiY2UzMjk4LWM1NGYtNDNmNS04M2NiLTM0OWMwOTc4NzJiNiJ9.yiYwfBqBjnnSxXTvvJ8RhlqqUYOty0TIUiq_trP6hY4YD58Q6rXZBuIGyHkHKCoiabIEEZ8BCm1dIm9HSS3_Bw
NEXT_PUBLIC_APP_NAME="Themed Edits - Client Management System"
```

### Initial Database Setup & Seeding
To initialize the cloud schema and verify tables:

```bash
node scripts/init-db.mjs
node scripts/seed.mjs
```

---

## Deployment on Vercel

1. Push your repository to GitHub:
   ```bash
   git remote add origin https://github.com/ThemedEdits/freelance-system.git
   git branch -M main
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Add the two environment variables in **Project Settings > Environment Variables**:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
4. Click **Deploy**. Vercel will build and launch your application seamlessly!

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
