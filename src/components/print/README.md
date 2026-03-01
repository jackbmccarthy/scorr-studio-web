# Print and Share Features - Scorr Studio V2

This implementation adds comprehensive print and share capabilities to Scorr Studio V2 for tournament directors.

## What Was Created

### 1. Print Components (`src/components/print/`)

#### `QRCode.tsx`
- QR code component using `qrcode.react`
- Generates scannable QR codes linking to live views
- Customizable size and label
- Clean white background for printing

#### `PrintLayout.tsx`
- Base wrapper for all printable pages
- Consistent header with tournament name and title
- Footer with timestamp and QR code
- Print-optimized styling

#### `PrintableSchedule.tsx`
- Match schedule grid view
- Groups matches by date
- Shows time, teams, scores, sport, and status
- Clean table layout optimized for printing
- Supports both scheduled and completed matches

#### `PrintableBracket.tsx`
- Tournament bracket visualization
- Groups matches by round
- Shows winners with green highlighting
- Supports single and double elimination formats
- TBD placeholder for upcoming matches

#### `PrintableCourtAssignments.tsx`
- Court/table schedule organized by location
- Time-based sorting within each court
- Shows match count per court
- Clear status indicators

### 2. Print Center Page (`src/app/(app)/print/page.tsx`)

Interactive print management interface:
- **Selection Panel**: Choose what to print
  - Full match schedule
  - Court assignments
  - Tournament bracket
- **Bulk Printing**: Select multiple items
- **Print Preview**: Hidden on screen, visible in print mode
- **Actions**:
  - Print directly to printer
  - Download as PDF (via browser print dialog)
- **Features**:
  - Select all / clear all buttons
  - Item count display
  - Tips for PDF generation

### 3. Public Share Routes (`src/app/share/[token]/`)

#### `/share/[token]/page.tsx` - Bracket View
- Public tournament bracket display
- Auto-generated QR code for sharing
- Live status badges
- Print and share buttons
- No authentication required

#### `/share/[token]/schedule/page.tsx` - Schedule View
- Public match schedule display
- Live/scheduled/finished match counts
- Grouped by date
- Auto-refresh indicator
- QR code integration
- Print and share capabilities

### 4. Print Styles (`src/app/globals.css`)

Comprehensive print CSS:
- **Page Setup**: Letter size (8.5" x 11") with 0.5" margins
- **Hide Elements**: Navigation, buttons, overlays
- **Color Reset**: White background, black text
- **Typography**: Optimized for print readability
- **Page Breaks**: Controls to avoid breaking inside sections
- **Tables**: Clean borders and spacing
- **QR Codes**: Protected from page breaks
- **Links**: Show URLs in parentheses
- **Utility Classes**:
  - `.print-only` - Visible only when printing
  - `.screen-only` - Hidden when printing
  - `.print-page-break-before` - Force page break
  - `.print-page-break-inside-avoid` - Prevent breaks

### 5. UI Component Additions

#### `Checkbox.tsx`
- Radix UI checkbox component
- Required for print selection UI
- Integrated with design system

### 6. Integration Points

#### Dashboard (`src/app/(app)/page.tsx`)
- Added "Print Center" button in hero section
- Added "Print Center" in quick actions

#### Matches List (`src/app/(app)/matches/page.tsx`)
- Added "Print Schedules" button in header
- Links to print center

#### Match Detail (`src/app/(app)/matches/[id]/page.tsx`)
- Added "Print" button in match header
- Direct print trigger for individual matches

## Features Implemented

### ✅ Printable Pages
- Match schedules with date grouping
- Tournament brackets with round progression
- Court assignments organized by location
- Clean, professional layouts

### ✅ QR Code Integration
- Auto-generated on all printable pages
- Links back to live views
- Easy scanning for spectators
- Consistent sizing and styling

### ✅ Bulk Printing
- Print center with multi-select
- Print schedules, brackets, and courts together
- Select all / clear all functionality
- Print preview generation

### ✅ Shareable URLs
- Public bracket view at `/share/[token]`
- Public schedule at `/share/[token]/schedule`
- QR codes on share pages
- Copy link functionality
- No authentication required

### ✅ Print Optimization
- Letter paper size (8.5" x 11")
- Proper margins for binding
- Auto page breaks between sections
- Black & white optimized
- Date/time printed footer
- QR code and URL in footer

## Usage Examples

### Tournament Director Workflow

1. **Before Tournament**
   - Go to Print Center
   - Select "Full Match Schedule" and "Court Assignments"
   - Print for officials and volunteers
   - Share public schedule link with participants

2. **During Tournament**
   - Print updated brackets as rounds complete
   - Share bracket link for live updates
   - Print court assignments for venue staff

3. **After Tournament**
   - Print final brackets and results
   - Share results page for participants

### For Spectators

1. Scan QR code on printed schedules
2. View live bracket updates on mobile
3. Share links with other spectators
4. No app or login required

## Technical Details

### Dependencies Added
```json
"qrcode.react": "^3.1.0"
```

### File Structure
```
src/
├── components/
│   └── print/
│       ├── index.ts
│       ├── QRCode.tsx
│       ├── PrintLayout.tsx
│       ├── PrintableSchedule.tsx
│       ├── PrintableBracket.tsx
│       └── PrintableCourtAssignments.tsx
├── app/
│   ├── (app)/
│   │   ├── print/
│   │   │   └── page.tsx
│   │   ├── page.tsx (updated)
│   │   └── matches/
│   │       ├── page.tsx (updated)
│   │       └── [id]/page.tsx (updated)
│   └── share/
│       └── [token]/
│           ├── page.tsx
│           └── schedule/
│               └── page.tsx
└── components/ui/
    ├── checkbox.tsx (new)
    └── index.ts (updated)
```

### Print CSS Classes
```css
.print-only        /* Show only when printing */
.screen-only       /* Hide when printing */
.print-container   /* Print-optimized container */
.print-header      /* Print page header */
.print-content     /* Print page content */
.print-footer      /* Print page footer */
.print-qr          /* QR code container */
.print-page-break-before         /* Force page break before */
.print-page-break-after          /* Force page break after */
.print-page-break-inside-avoid   /* Avoid breaking inside element */
```

## Testing

### Build Verification
```bash
npm run build
```
✅ Build completed successfully with no errors

### Print Preview Testing
1. Navigate to `/app/print`
2. Select items to print
3. Click "Print Selected"
4. Verify print preview shows correct layout
5. Check QR codes are visible
6. Confirm page breaks work properly

### Share Route Testing
1. Navigate to `/share/test-token`
2. Verify bracket displays correctly
3. Test QR code generation
4. Check print button works
5. Test `/share/test-token/schedule`
6. Verify schedule grouping by date

## Future Enhancements

1. **PDF Generation**
   - Server-side PDF generation using Puppeteer
   - Custom PDF templates
   - Batch PDF downloads

2. **Advanced Share Features**
   - Customizable share tokens
   - Token expiration
   - Access analytics

3. **Print Templates**
   - Multiple layout options
   - Sponsor logo placement
   - Custom branding

4. **Mobile Print**
   - Mobile-optimized print layouts
   - AirPrint support
   - Print queue management

## Notes

- Mock data is currently used - replace with Convex queries in production
- QR URLs should use actual tournament tokens
- Consider adding print job history for audit trails
- Tournament name and details should come from database
- Add support for multiple paper sizes (A4, etc.)
