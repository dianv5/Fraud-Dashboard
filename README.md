# Fraud Detection Dashboard

A comprehensive Next.js 16 fraud detection and recovery performance monitoring dashboard with bilingual support (Indonesian/English), real-time data from Google Sheets, and demo data fallback.

## Features

✅ **Three Main Pages**
- **Fraud Performance**: KPIs, trend charts, fraud distribution, heatmaps, and alerts
- **Recovery Performance**: Recovery metrics and collector performance (ready for implementation)
- **Fraud Investigation**: Investigation details and root cause analysis (ready for implementation)

✅ **Data Sources**
- Real-time data from Google Sheets (with public CSV export URLs)
- Demo data fallback when Google Sheets is unavailable
- Automatic data parsing and filtering

✅ **Bilingual Support**
- Indonesian (ID) and English (EN)
- Language toggle in the header
- All UI text translated

✅ **Interactive Components**
- KPI cards with metrics and icons
- Line charts (Fraud & Recovery Trend)
- Pie charts (Fraud by Type distribution)
- Bar charts (Heatmap by HUB, Recovery by Channel)
- Data tables with search and pagination
- Alert system with automatic rule-based triggers
- Responsive design

✅ **Styling**
- Modern CSS variable-based theming
- No external component libraries (pure React + Recharts)
- Inline styles matching the original design
- CSS variables for consistent color system

## Project Structure

```
/vercel/share/v0-project/
├── app/
│   ├── layout.tsx          # Root layout with LanguageProvider
│   ├── globals.css         # Global styles and CSS variables
│   ├── page.tsx            # Fraud Performance page
│   ├── recovery/
│   │   └── page.tsx        # Recovery Performance page (placeholder)
│   └── investigation/
│       └── page.tsx        # Investigation page (placeholder)
├── components/
│   ├── LanguageProvider.tsx    # Language context provider
│   ├── Header.tsx              # Navigation and language toggle
│   ├── KPICard.tsx             # KPI metric cards
│   ├── Charts.tsx              # All chart components (Trend, Fraud by Type, Heatmap, etc.)
│   ├── Alerts.tsx              # Alert system component
│   └── Table.tsx               # Data table with search and pagination
├── utils/
│   ├── types.ts                # TypeScript interfaces and constants
│   ├── formatters.ts           # Number formatting and date utilities
│   ├── translations.ts         # Bilingual text and language hook
│   ├── data-generators.ts      # Demo data generation
│   ├── sheets-fetcher.ts       # Google Sheets CSV fetching and parsing
│   └── data-processors.ts      # Data grouping, calculations, and alerts
├── package.json
├── next.config.js
└── tsconfig.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd /vercel/share/v0-project
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
npm start
```

## Configuration

### Google Sheets Data

The app is configured to fetch data from three Google Sheets:

1. **Fraud Cases** (`utils/types.ts` - `SHEET_URLS.fraudCases`)
   - Required columns: Case_ID, Date, Fraud_Type, Pelaku, Fraud_Value_IDR, Recovery_Value_IDR, Partial_Payment_IDR, Status, Province, City, HUB, Project, Invoice_No, Invoiced_Status, Somasi_Level, Fraud_Reason, Investigator_Name, Data_Completeness_Score

2. **Recovery Data** (`utils/types.ts` - `SHEET_URLS.recoveryData`)
   - Required columns: Recovery_Date, Case_ID, Collector_Names, Channel_Salary_Deduction_IDR, Channel_Joint_Liability_IDR, Channel_Deposit_Deduction_IDR, Channel_Field_Recovery_IDR, Channel_Platform_Fee_IDR, Total_Recovery_IDR, Payment_Type

3. **Campaign Calendar** (`utils/types.ts` - `SHEET_URLS.campaignCalendar`)
   - Required columns: Project, Month, Campaign_Type, Expected_Fraud_Rate_%

**To use your own Google Sheets:**

1. Open your Google Sheet
2. File → Share → Publish to Web
3. For each sheet, select "CSV" format and copy the URL
4. Update `SHEET_URLS` in `utils/types.ts`

### Color Scheme

All colors are defined as CSS variables in `app/globals.css`:

- **Background**: `--color-background-primary`, `--color-background-secondary`
- **Borders**: `--color-border-primary`, `--color-border-secondary`, `--color-border-tertiary`
- **Text**: `--color-text-primary`, `--color-text-secondary`, `--color-text-tertiary`
- **Chart Colors**: `--color-chart-purple`, `--color-chart-blue`, `--color-chart-red`, etc.
- **Status Colors**: `--color-status-open`, `--color-status-solved`, etc.

To customize, edit `app/globals.css`.

## Key Components

### KPICard
Displays metric cards with labels, values, units, and icons. Used for KPIs like total cases, fraud value, recovery ratio.

### Charts
- `TrendChart`: Line chart showing fraud and recovery trends over time
- `FraudByTypeChart`: Pie chart showing fraud distribution by type
- `HeatmapChart`: Bar chart showing fraud value by HUB
- `RecoveryByChannelChart`: Bar chart showing recovery by channel

### AlertsSection
Automatically generates alerts based on fraud analysis:
- High fraud volume (avg > 1M IDR)
- Low recovery ratio (< 30%)
- High number of open cases (> 50%)
- Perpetrator dominance (> 15% of cases)

### CasesTable
Data table with:
- Full-text search (ID, type, perpetrator, project, invoice)
- Pagination (10 items per page by default)
- Color-coded status indicators
- Sortable columns (click headers to sort)

## Bilingual Support

The app supports Indonesian and English out of the box. To add a new language:

1. Add language code to `Language` type in `utils/translations.ts`
2. Add translations to `T` object in `utils/translations.ts`
3. Add language option to language toggle in `components/Header.tsx`

## Demo Data

If Google Sheets is unavailable, the app automatically falls back to generated demo data:
- 300 fraud cases with realistic distributions
- 150 recovery records
- Campaign calendar for 6 months

To use demo data regardless of Google Sheets status, modify `app/page.tsx`:

```typescript
// Always use demo data
const demoData = genCases(300);
setCases(demoData);
```

## Performance

- **Lazy Loading**: Data fetching only happens on component mount
- **Memoization**: Expensive calculations (KPIs, trends) are memoized with `useMemo`
- **Responsive**: Mobile-first design with CSS media queries
- **Lightweight**: No heavy component libraries, minimal dependencies

## Troubleshooting

### "Failed to load data from Google Sheets"
- Ensure your Google Sheet is published to the web as CSV
- Check that all required columns exist with exact names
- Verify the public URL is accessible
- The app will automatically fallback to demo data

### Language not changing
- Make sure you're using the language toggle in the header
- Language state is client-side only and persists during the session

### Charts not displaying
- Check that Recharts is properly installed: `npm list recharts`
- Ensure chart data is not empty
- Check browser console for errors

### Icons not showing
- Tabler Icons font should be loaded from CDN in `app/globals.css`
- If icons are missing, check that the CDN URL is accessible

## Next Steps

### Ready for Implementation:
1. **Recovery Page** - Add recovery performance KPIs, charts, and collector rankings
2. **Investigation Page** - Add investigator performance, root cause analysis, case details
3. **Filters** - Implement UI filters for date range, location, fraud type
4. **Export** - Add CSV/PDF export functionality
5. **Real-time Updates** - Add WebSocket support for live data updates
6. **Authentication** - Add user login and role-based access
7. **Notifications** - Add email/SMS alerts for critical fraud events

### Customization:
- Modify colors in `app/globals.css`
- Add new chart types in `components/Charts.tsx`
- Extend data processors in `utils/data-processors.ts`
- Add new pages following the same component structure

## Dependencies

```json
{
  "next": "^16.0.0",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "recharts": "^2.12.0",
  "@tabler/icons-react": "^3.0.0"
}
```

## License

ISC

## Support

For issues or questions, check:
1. Browser console for error messages
2. `utils/types.ts` for Google Sheets URL configuration
3. `components/` for component-specific issues
4. `app/globals.css` for styling issues

---

**Made with v0 - Vercel's AI code generation platform**
