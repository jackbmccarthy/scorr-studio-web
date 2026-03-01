# Print & Share Features

Scorr Studio V2 provides comprehensive printing and sharing capabilities for tournament directors.

## Table of Contents

- [Print Center](#print-center)
- [Printing Schedules](#printing-schedules)
- [Printing Brackets](#printing-brackets)
- [Court Assignments](#court-assignments)
- [QR Codes](#qr-codes)
- [Share Links](#share-links)
- [Print Settings](#print-settings)

---

## Print Center

Access the Print Center from the sidebar or via **Matches → Print Schedules**.

The Print Center provides a unified interface for printing:
- Match schedules
- Tournament brackets
- Court/table assignments

### Overview

```
┌─────────────────────────────────────────────────────────┐
│  Print Center                                           │
├─────────────────────────────────────────────────────────┤
│  ☐ Full Match Schedule                                  │
│     All matches grouped by date and time                │
│                                                         │
│  ☐ Court Assignments                                    │
│     Matches organized by location                       │
│                                                         │
│  ☐ Tournament Bracket                                   │
│     Visual bracket with results                         │
│                                                         │
│  [Select All] [Clear All]                               │
│                                                         │
│  ─────────────────────────────────────────────────      │
│  2 items selected                                       │
│  [Print Selected]  [Download PDF]                       │
└─────────────────────────────────────────────────────────┘
```

---

## Printing Schedules

### What's Included

The printable schedule displays:

| Field | Description |
|-------|-------------|
| Date | Match date, grouped automatically |
| Time | Scheduled start time |
| Teams | Player/team names |
| Score | Final score (if completed) |
| Sport | Sport type (for multi-sport events) |
| Status | Scheduled/Live/Finished |
| Court | Location (if assigned) |

### How to Print

1. Navigate to **Print Center**
2. Check **Full Match Schedule**
3. Click **Print Selected**
4. In the print dialog:
   - Select your printer, or
   - Choose "Save as PDF" for digital distribution
5. Click Print

### Print Layout

The schedule uses an optimized layout:

```
┌─────────────────────────────────────────────────────────┐
│  [Logo]  Summer Tennis Championship                     │
│          Match Schedule                                 │
├─────────────────────────────────────────────────────────┤
│  Saturday, June 15, 2024                                │
│  ┌─────────┬──────────────────────┬───────┬──────────┐ │
│  │ Time    │ Match                │ Score │ Status   │ │
│  ├─────────┼──────────────────────┼───────┼──────────┤ │
│  │ 9:00 AM │ Smith vs Johnson     │ 3-1   │ Finished │ │
│  │ 9:00 AM │ Williams vs Davis    │ 2-3   │ Finished │ │
│  │ 10:30AM │ Brown vs Garcia      │ -     │ Scheduled│ │
│  │ 10:30AM │ Miller vs Wilson     │ -     │ Live     │ │
│  └─────────┴──────────────────────┴───────┴──────────┘ │
│                                                         │
│  Sunday, June 16, 2024                                  │
│  ...                                                    │
├─────────────────────────────────────────────────────────┤
│  Printed: June 15, 2024 8:30 AM                         │
│  [QR Code]  scorr.studio/s/abc123                       │
└─────────────────────────────────────────────────────────┘
```

### Tips

- **Color vs B&W**: Schedule prints well in black and white
- **Paper Size**: Optimized for US Letter (8.5" x 11")
- **Scale**: Use "Fit to Page" for best results
- **Double-Sided**: Enable for large schedules

---

## Printing Brackets

### What's Included

- Visual bracket layout
- Match pairings
- Scores and winners
- Round labels (Quarterfinals, Semifinals, Finals)
- Champion highlight

### How to Print

1. Navigate to **Print Center**
2. Check **Tournament Bracket**
3. Click **Print Selected**

### Bracket Layout

```
┌─────────────────────────────────────────────────────────┐
│  Summer Tennis Championship                             │
│  Men's Singles Bracket                                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ROUND OF 8        SEMIFINALS       FINALS              │
│                                                         │
│  Smith ──────┐                                       │ │
│       3      │                                       │ │
│  Johnson ────┼── Smith ───┐                          │ │
│              │     3      │                          │ │
│  Williams ───┘            │                          │ │
│       2      │            ├── Smith ───┐             │ │
│  Davis ──────┘            │     3      │             │ │
│                           │            │   ★ SMITH   │ │
│  Brown ──────┐            │            │      3      │ │
│       1      │            │            │             │ │
│  Garcia ─────┼── Garcia ──┘            │             │ │
│              │     2                   │             │ │
│  Miller ─────┘                         │             │ │
│       0      │                         │             │ │
│  Wilson ─────┘                         │             │ │
│                           Garcia ──────┘             │ │
│                                         1             │ │
│                                         │             │ │
│                                         Garcia ──────┘ │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  [QR Code]  Live updates: scorr.studio/s/abc123         │
└─────────────────────────────────────────────────────────┘
```

### Double Elimination

For double elimination tournaments, the printout includes:
- Winners bracket
- Losers bracket
- Grand final match

---

## Court Assignments

### What's Included

Court assignments organize matches by location:

- Court/Table number or name
- Time slots
- Match details
- Match count per court

### How to Print

1. Navigate to **Print Center**
2. Check **Court Assignments**
3. Click **Print Selected**

### Assignment Layout

```
┌─────────────────────────────────────────────────────────┐
│  Summer Tennis Championship                             │
│  Court Assignments                                      │
├─────────────────────────────────────────────────────────┤
│  ═══ COURT 1 (4 matches) ═══                            │
│  ┌─────────┬──────────────────────┬──────────┐         │
│  │ Time    │ Match                │ Status   │         │
│  ├─────────┼──────────────────────┼──────────┤         │
│  │ 9:00 AM │ Smith vs Johnson     │ Finished │         │
│  │ 10:30AM │ Williams vs Davis    │ Finished │         │
│  │ 12:00PM │ Brown vs Garcia      │ Live     │         │
│  │ 1:30 PM │ Miller vs Wilson     │ Scheduled│         │
│  └─────────┴──────────────────────┴──────────┘         │
│                                                         │
│  ═══ COURT 2 (4 matches) ═══                            │
│  ┌─────────┬──────────────────────┬──────────┐         │
│  │ Time    │ Match                │ Status   │         │
│  ├─────────┼──────────────────────┼──────────┤         │
│  │ 9:00 AM │ Adams vs Thomas      │ Finished │         │
│  │ ...     │ ...                  │ ...      │         │
│  └─────────┴──────────────────────┴──────────┘         │
├─────────────────────────────────────────────────────────┤
│  [QR Code]  Live updates: scorr.studio/s/abc123         │
└─────────────────────────────────────────────────────────┘
```

### Use Cases

- Assign to court supervisors
- Post at each court/table
- Distribute to volunteers
- Player reference

---

## QR Codes

### How QR Codes Work

Every printable page includes a QR code that links to:
- Live schedule view
- Live bracket updates
- Current standings

### Generating QR Codes

QR codes are **automatically generated** when:
- Creating a competition
- Printing any document
- Sharing a bracket

### QR Code Details

| Property | Value |
|----------|-------|
| Format | PNG |
| Size | 100x100 pixels (print-optimized) |
| Error Correction | Medium (15% recovery) |
| Background | White |

### Scanning

When someone scans the QR code:
1. Opens the public view in their browser
2. No login required
3. Auto-refreshes every 30 seconds
4. Shows live scores and status

---

## Share Links

### Public URLs

Generate shareable links for:

| View | URL Pattern |
|------|-------------|
| Bracket | `/share/[token]` |
| Schedule | `/share/[token]/schedule` |
| Display | `/display/[id]` |

### Creating Share Links

1. Go to your competition
2. Click **Share** button
3. Copy the link

### Features

- **No login required** - Anyone with the link can view
- **Live updates** - Auto-refreshes with current data
- **Mobile friendly** - Works on phones and tablets
- **Print from web** - Viewers can print their own copies

### Copying Links

```
┌─────────────────────────────────────────────────────────┐
│  Share This Bracket                                     │
├─────────────────────────────────────────────────────────┤
│  Link: https://scorr.studio/share/abc123               │
│                                                         │
│  [📋 Copy Link]  [📷 QR Code]  [🐦 Tweet]              │
└─────────────────────────────────────────────────────────┘
```

---

## Print Settings

### Paper Configuration

| Setting | Default |
|---------|---------|
| Paper Size | US Letter (8.5" x 11") |
| Orientation | Portrait (Landscape for brackets) |
| Margins | 0.5" all sides |
| Scale | Fit to Page |

### Browser Print Settings

For best results:

1. **Chrome/Edge**:
   - More settings → Margins → Custom (0.5")
   - Check "Background graphics" for colors

2. **Firefox**:
   - Page Setup → Margins → 0.5"
   - Print Background Colors: Yes

3. **Safari**:
   - Show Details → Scale: 100%
   - Print backgrounds: Yes

### PDF Generation

To save as PDF instead of printing:

1. Click **Print Selected**
2. In print dialog, choose "Save as PDF"
3. Select location and save

PDFs are great for:
- Emailing to participants
- Posting on websites
- Archiving results

---

## Print CSS Classes

For developers, these CSS classes control print behavior:

### Visibility

```css
.print-only { }      /* Shows only when printing */
.screen-only { }     /* Hides when printing */
```

### Page Breaks

```css
.print-page-break-before { }      /* Force break before */
.print-page-break-after { }       /* Force break after */
.print-page-break-inside-avoid { } /* Prevent breaking inside */
```

### Layout

```css
.print-container { }  /* Print-optimized container */
.print-header { }     /* Header section */
.print-content { }    /* Main content */
.print-footer { }     /* Footer with QR code */
```

---

## Bulk Printing

### Printing Multiple Items

1. Select multiple checkboxes in Print Center
2. Click **Print Selected**
3. All items print in sequence

### Select All / Clear All

- **Select All**: Checks all available items
- **Clear All**: Unchecks all items

### Item Count

The footer shows how many items are selected:
```
3 items selected  [Print Selected]
```

---

## Best Practices

### Before Tournament

1. Print full schedules for:
   - Registration desk
   - Tournament directors
   - Court supervisors

2. Print court assignments for:
   - Each court/table
   - Volunteer stations

3. Share public links via:
   - Tournament website
   - Email to participants
   - Social media

### During Tournament

1. Re-print brackets after each round
2. Update court assignments as needed
3. Share updated links

### After Tournament

1. Print final brackets and results
2. Archive PDFs for records
3. Share final results on social media

---

## Troubleshooting

### Print Preview Shows Blank

- Ensure data is loaded
- Check browser console for errors
- Try a different browser

### QR Code Not Scanning

- Ensure adequate contrast
- Check URL is correct
- Try increasing print size

### Layout Issues

- Check paper size matches settings
- Ensure margins are set correctly
- Try different scale settings

### Colors Not Printing

- Enable "Background graphics" in print settings
- Check printer color settings
- Consider B&W-optimized layout
