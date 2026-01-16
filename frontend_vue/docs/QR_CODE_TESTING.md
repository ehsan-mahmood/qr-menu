# QR Code Generation & Testing Guide

## How to Generate and Test QR Codes

### Step 1: Install Dependencies
First, install the new QR code library:
```bash
cd frontend_vue
npm install
```

This installs the `qrcode` library needed to generate visual QR codes.

### Step 2: Generate a QR Code
1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Navigate to the QR Management page:
   - Go to: `http://localhost:3000` (or your IP)
   - Click "Scan QR Code" or navigate to `/qr`

3. Fill in the form:
   - **Table Number**: Enter any number (e.g., "5")
   - **Menu ID**: Enter `test-menu-001` (or any menu ID)
   - Click "Generate QR Code"

4. A QR code will appear with:
   - Visual QR code image (scannable)
   - Generated token
   - QR Code URL (clickable link)
   - Copy URL button

### Step 3: Test the QR Code

**Option A: Scan with Phone**
1. Display the QR code on your screen
2. Open your phone camera and scan the QR code
3. It will open the URL in your browser
4. The menu should load automatically

**Option B: Copy and Open URL**
1. Click "Copy URL" button
2. Paste the URL in any browser (desktop or mobile)
3. The menu will load automatically

**Option C: Direct URL Access**
The QR code contains a URL like:
```
http://localhost:3000/?qr=TOKEN
```
or if accessing via IP:
```
http://192.168.1.13:3000/?qr=TOKEN
```

Just open this URL in any browser to test.

### How It Works

1. **QR Code Generation**:
   - Creates a unique token via the service
   - Generates a visual QR code image
   - QR code contains: `http://YOUR_IP:3000/?qr=TOKEN`

2. **QR Code Scanning/Opening**:
   - When the URL is opened, Landing page detects `?qr=TOKEN` parameter
   - Fetches QR data using the token
   - Loads the associated menu
   - Redirects to `/menu/MENU_ID`

3. **Test Mode**:
   - Uses test data from `src/utils/testData.js`
   - Token `test-qr-token-001` is pre-configured
   - Works without backend connection

### Quick Test

**Test Token**: `test-qr-token-001`

You can manually test by opening:
```
http://localhost:3000/?qr=test-qr-token-001
```

This should redirect to the demo menu automatically.

### Notes

- **IP Address**: If accessing from another device, use your IP address (e.g., `http://192.168.1.13:3000`)
- **QR Code Format**: The QR code contains a full URL, not just the token
- **Auto-redirect**: Landing page automatically detects QR parameter and redirects
- **Mobile Testing**: Best tested on mobile devices using phone camera

### Troubleshooting

**QR code not generating?**
- Check browser console for errors
- Make sure `npm install` was run to install the `qrcode` library

**Menu not loading after scanning?**
- Check that the token exists in test data
- Verify network requests in browser DevTools
- Check that Menu ID matches an existing menu

**Can't access from phone?**
- Ensure dev server is running with `host: '0.0.0.0'` (already configured)
- Use your computer's IP address, not `localhost`
- Check firewall settings if needed

---

**Ready to test!** 🎉

