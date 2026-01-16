# Demo Mode Implementation Summary

This document summarizes the implementation of demo mode for GitHub Pages deployment.

## ✅ Completed Features

### 1. Auto-Detection of Demo Mode
- **Location**: `src/config.js`
- **Behavior**: Automatically detects GitHub Pages deployment via hostname (`github.io`)
- **Result**: `TEST_MODE` and `DEMO_MODE` are automatically enabled

### 2. LocalStorage Persistence
- **Location**: `src/utils/demoStorage.js`
- **Features**:
  - Order storage (up to 100 orders)
  - Analytics tracking (scans, views, clicks)
  - Automatic initialization
  - Data persists across browser sessions

### 3. Service Updates

#### Order Service (`src/services/orderService.js`)
- ✅ Creates orders in localStorage (demo mode)
- ✅ Updates order status with persistence
- ✅ Retrieves orders from localStorage
- ✅ Filters and pagination support

#### Analytics Service (`src/services/analyticsService.js`)
- ✅ Tracks menu scans
- ✅ Tracks menu views
- ✅ Tracks item clicks
- ✅ Tracks order placement
- ✅ Generates top items analytics
- ✅ Real-time dashboard data from localStorage

### 4. JSON Data Files
- **Location**: `public/`
- **Files**:
  - `menu.json` - Default menu data
  - `qr_tokens.json` - Pre-configured QR token mappings

### 5. Build Configuration
- **Location**: `vite.config.js`
- **Features**:
  - Configurable base path for GitHub Pages
  - Optimized build output
  - Asset path handling

### 6. Deployment Automation
- **GitHub Actions**: `.github/workflows/deploy-gh-pages.yml`
- **Deployment Script**: `deploy-gh-pages.sh`
- **Documentation**: `docs/GITHUB_PAGES_DEPLOYMENT.md`

## Demo Mode Workflow

### 1. Menu Setup (OCR Simulation)
- Uses test data from `testData.js`
- Menu loaded from `testMenu` object
- Supports menu editing (changes stored in memory)

### 2. QR Code Simulation
- QR tokens mapped via `qr_tokens.json`
- Pre-saved QR codes for demo tables
- Automatic menu loading based on token

### 3. Orders / Basket
- Orders stored in localStorage
- Persistent across page refreshes
- Toast notifications for new orders
- Real-time order updates

### 4. Dashboard / Analytics
- Data loaded from localStorage
- Real-time updates as events occur
- Top items calculated from click data
- Scan/view statistics tracked

### 5. Order Management
- Status updates persist in localStorage
- Time tracking for orders
- Status history maintained

### 6. Notifications
- Toast notifications for new orders
- Visual indicators for new orders
- Auto-dismiss after 2-3 seconds

## Demo Flow (4 minutes / 8 clicks)

1. **Intro** (0:30-1:00) - Explain digital menu value
2. **Menu Upload** (1 click) - "Scan menu" loads test data
3. **Menu Confirmation** (1 click) - Quick edit if needed
4. **QR Code Scan** (1 click) - Simulate customer scan
5. **Add Items** (2-3 clicks) - Select menu items
6. **Send Order** (1 click) - Place order, see notification
7. **Dashboard Updates** (automatic) - Orders appear
8. **Analytics Display** (automatic) - Stats update

## Key Implementation Details

### Auto-Detection Logic
```javascript
const isGitHubPages = typeof window !== 'undefined' && (
  window.location.hostname === 'github.io' ||
  window.location.hostname.includes('github-pages') ||
  window.location.hostname.includes('gh-pages')
)
```

### LocalStorage Keys
- `demo_orders` - All orders
- `demo_analytics` - Analytics summary
- `demo_menu_scans` - Scan history
- `demo_menu_views` - View history
- `demo_item_clicks` - Item click counts

### Data Flow
1. User actions trigger service calls
2. Services check `DEMO_MODE` flag
3. If demo mode, data stored in localStorage
4. If not demo mode, uses in-memory test data
5. Dashboard components read from localStorage
6. Real-time updates via reactive Vue components

## Testing Locally

To test demo mode locally:

1. Build the project:
   ```bash
   npm run build
   npm run preview
   ```

2. Or simulate GitHub Pages hostname:
   - Use browser dev tools to modify hostname
   - Or set `VITE_TEST_MODE=true` in `.env`

## Deployment

See `docs/GITHUB_PAGES_DEPLOYMENT.md` for complete deployment instructions.

### Quick Deploy
```bash
cd frontend
./deploy-gh-pages.sh
```

Or use GitHub Actions (automatic on push to `main`).

## Notes

- ✅ No backend required
- ✅ All data stored locally in browser
- ✅ Persistent across sessions
- ✅ Each visitor has isolated data
- ✅ Safe for demo (no real payments)
- ✅ Fast loading (no API calls)
- ✅ Works offline (after initial load)

## Future Enhancements

Potential improvements for future iterations:
- [ ] Import/export demo data
- [ ] Pre-populated sample orders
- [ ] Multiple menu support
- [ ] Demo mode badge/indicator
- [ ] Data reset button
- [ ] Demo walkthrough/tutorial
