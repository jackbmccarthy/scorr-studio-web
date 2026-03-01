# Testing Print and Share Features

## Quick Start Testing

### 1. Start Development Server
```bash
cd /home/jack/clawd/scorr-studio-v2
npm run dev
```

### 2. Test Print Center
1. Navigate to: `http://localhost:3000/app/print`
2. Select items to print:
   - ✓ Full Match Schedule
   - ✓ Court Assignments
   - ✓ Tournament Bracket
3. Click "Print Selected"
4. Browser print dialog opens
5. Verify:
   - Layout is clean
   - QR codes visible
   - Tables formatted correctly
   - Page breaks work
   - No navigation/buttons showing

### 3. Test Public Share Routes

#### Bracket View
1. Navigate to: `http://localhost:3000/share/test-tournament`
2. Verify:
   - Bracket displays correctly
   - QR code generates
   - Rounds are organized
   - Winners highlighted
   - Print button works
   - Share button copies link

#### Schedule View
1. Navigate to: `http://localhost:3000/share/test-tournament/schedule`
2. Verify:
   - Schedule grouped by date
   - Match counts show
   - Live/scheduled/finished badges
   - QR code visible
   - Print works
   - Share works

### 4. Test Print Buttons

#### Dashboard
1. Navigate to: `http://localhost:3000/app`
2. Click "Print Center" button (2 locations)
3. Verify it goes to print center

#### Matches List
1. Navigate to: `http://localhost:3000/app/matches`
2. Click "Print Schedules" button
3. Verify it goes to print center

#### Individual Match
1. Navigate to: `http://localhost:3000/app/matches/1?sport=table-tennis`
2. Click "Print" button in header
3. Verify print dialog opens

### 5. Test Print CSS

#### Check Print Preview
1. On any page, press `Ctrl+P` (or `Cmd+P` on Mac)
2. Verify:
   - Dark overlays (grid, noise) are hidden
   - Navigation is hidden
   - Only content shows
   - Background is white
   - Text is black
   - Page breaks avoid splitting content

### 6. Test QR Codes

#### Visual Check
1. Navigate to any share page
2. Verify QR code displays
3. Scan with phone camera
4. Verify it links to correct URL

### 7. Browser Compatibility

Test in multiple browsers:
- ✓ Chrome/Edge (Chromium)
- ✓ Firefox
- ✓ Safari
- ✓ Mobile browsers

## Expected Behaviors

### Print Dialog
- Should open browser's native print dialog
- Preview should show clean layout
- QR codes should be visible
- No dark theme elements

### Page Breaks
- Courts should not split across pages
- Brackets should break between rounds
- Schedules can break between dates

### QR Codes
- Size: 80-128px (depending on context)
- White background
- Black foreground
- Includes URL label (optional)

## Common Issues & Solutions

### Issue: QR code not showing
**Solution**: Check console for errors, verify qrcode.react is installed

### Issue: Print layout broken
**Solution**: Check @media print CSS is applied, clear cache

### Issue: Page breaks in wrong place
**Solution**: Add `print-page-break-inside-avoid` class to container

### Issue: Colors printing wrong
**Solution**: Ensure print CSS resets colors (bg: white, text: black)

## Production Checklist

Before deploying:
- [ ] Replace mock data with Convex queries
- [ ] Add proper authentication
- [ ] Generate real tournament tokens
- [ ] Test with actual tournament data
- [ ] Verify QR URLs are correct
- [ ] Test on mobile devices
- [ ] Check all print layouts
- [ ] Verify share links work externally

## Files to Update for Production

1. **`src/app/(app)/print/page.tsx`**
   - Replace `mockMatches` with Convex query
   - Replace `mockBracketMatches` with Convex query
   - Add real tournament data

2. **`src/app/share/[token]/page.tsx`**
   - Fetch tournament by token from Convex
   - Validate token exists
   - Add error handling

3. **`src/app/share/[token]/schedule/page.tsx`**
   - Fetch matches by token from Convex
   - Add real-time updates (Convex subscription)
   - Add error handling

4. **All print components**
   - Update to use Convex types
   - Add loading states
   - Add error boundaries

## Performance Testing

### Large Tournaments (100+ matches)
1. Test print preview load time
2. Verify no browser freezing
3. Check memory usage
4. Test PDF generation time

### Mobile Testing
1. Test share pages on mobile
2. Verify QR codes scan correctly
3. Check responsive design
4. Test print from mobile browser

## Accessibility Testing

1. Verify print versions are readable
2. Check color contrast (B&W)
3. Ensure QR codes have text fallback
4. Test with screen readers (screen view)

## Support

For issues or questions:
- Check README: `src/components/print/README.md`
- Check summary: `PRINT_FEATURES_SUMMARY.md`
- Review code comments
- Check browser console for errors
