# Quick Start Guide

## Installation & Running

```bash
# Navigate to project
cd /vercel/share/v0-project

# Install dependencies (already done)
npm install

# Start development server
npm run dev

# Visit http://localhost:3000
```

## What You'll See

### Main Dashboard (Fraud Performance)
1. **Header** - Logo, navigation (3 pages), language toggle (ID/EN)
2. **KPI Cards** - 5 metric boxes with icons:
   - Total Cases: 20
   - Fraud Value: Rp 3.7 rb
   - Recovery Value: Rp 10.3 rb
   - Outstanding Fraud: -6.625
   - Recovery Ratio: 280.6%
3. **Charts** - Two visualizations side-by-side:
   - Tren Fraud & Recovery (line chart)
   - Fraud by Jenis (pie chart)
4. **Heatmap** - Fraud value by HUB (bar chart)
5. **Alerts** - Auto-generated fraud alerts (watch for "High Fraud by Single Perpetrator")
6. **Table** - 10 rows of fraud cases with search & pagination

### Features to Try
- ✅ **Language Toggle**: Click "EN" button → all text changes to English
- ✅ **Search**: Type "FRD-0001" in table search → filters to 1 case
- ✅ **Navigation**: Click "Performa Recovery" → shows recovery page
- ✅ **Pagination**: Scroll down, click "Next ›" → shows next 10 cases

## File Organization

```
app/                    → Pages (Next.js App Router)
├── page.tsx           → Main fraud dashboard
├── recovery/page.tsx  → Recovery performance (scaffold)
└── investigation/     → Fraud investigation (scaffold)

components/            → Reusable UI components
├── Header.tsx         → Navigation + language toggle
├── KPICard.tsx        → Metric card boxes
├── Charts.tsx         → All chart visualizations
├── Alerts.tsx         → Alert system
├── Table.tsx          → Data table with search
└── LanguageProvider.tsx → Bilingual context

utils/                 → Business logic & helpers
├── types.ts           → TypeScript interfaces + constants
├── formatters.ts      → Number/date formatting
├── translations.ts    → Bilingual text
├── data-generator.ts  → Demo data generation
├── sheets-fetcher.ts  → Google Sheets CSV fetching
└── data-processors.ts → Data calculations & alerts

app/globals.css        → CSS variables & global styles
```

## Key Concepts

### 1. Bilingual Support
Language is managed via React Context in `useLanguage()`:
```typescript
const { t, lang, setLang } = useLanguage();
// t = translations for current language
// lang = "id" or "en"
// setLang = function to change language
```

All text strings are in `utils/translations.ts`:
```typescript
T.id.kpiTotal = "Total Kasus"
T.en.kpiTotal = "Total Cases"
```

### 2. Data Pipeline
1. App tries to fetch from Google Sheets (URLs in `utils/types.ts`)
2. On error, falls back to generated demo data
3. Data is parsed into typed objects (`FraudCase[]`)
4. Components render the data

### 3. CSS Variables
All colors are CSS variables in `app/globals.css`:
```css
--color-chart-purple: #7C3AED;
--color-status-open: #EF4444;
```
Change color once, updates everywhere!

### 4. Alerts System
Automatically generated based on:
- High average fraud (> 1M IDR)
- Low recovery ratio (< 30%)
- High open cases count (> 50%)
- Dominant perpetrator (> 15% of cases)

## Customization

### Add Your Google Sheets
In `utils/types.ts`, update `SHEET_URLS`:
```typescript
fraudCases: "your-public-csv-url-here",
recoveryData: "your-public-csv-url-here",
campaignCalendar: "your-public-csv-url-here",
```

Steps:
1. Open your Google Sheet
2. File → Share → Publish to Web
3. Select "CSV" and copy URL
4. Paste into `SHEET_URLS`

### Change Colors
In `app/globals.css`, update CSS variables:
```css
--color-chart-purple: #7C3AED;  /* Change this */
--color-background-primary: #ffffff;  /* Or this */
```

### Add Translation
In `utils/translations.ts`:
```typescript
export const T = {
  id: {
    newKey: "Teks Indonesia",
  },
  en: {
    newKey: "English text",
  },
};
```
Then use: `const { t } = useLanguage(); t.newKey`

## Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy (from project directory)
vercel
```

### Build for Production
```bash
npm run build
npm start
```

## Troubleshooting

### Port 3000 Already in Use
Kill the existing process:
```bash
lsof -i :3000
kill -9 <PID>
npm run dev
```

### Google Sheets Not Loading
- Check URL is public (File → Share → Publish to Web)
- Verify CSV format is selected
- Check column names exactly match (Case_ID, Fraud_Type, etc.)
- App will show "Data Demo" badge and use demo data as fallback

### Language Not Changing
- Use the ID/EN buttons in top-right header
- Language state is client-side only (lost on page refresh)
- Current language: Check URL for signal or button highlight

### Charts Blank
- Check browser console for errors (F12)
- Ensure Recharts installed: `npm list recharts`
- Verify data is loading: check Network tab in DevTools

## Next Steps

1. **Test with Your Data**: Update Google Sheets URLs
2. **Customize Colors**: Edit `app/globals.css`
3. **Expand Pages**: Add content to `/recovery` and `/investigation`
4. **Add Filters**: Create FilterPanel component
5. **Deploy**: Push to GitHub and deploy to Vercel

## Documentation

- `README.md` - Full documentation & features
- `MIGRATION_SUMMARY.md` - Migration details
- `QUICK_START.md` - This file

---

**Ready to go!** Start the dev server with `npm run dev` and visit `http://localhost:3000` 🚀
