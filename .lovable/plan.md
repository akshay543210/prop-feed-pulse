

## Plan: Enhance Firms, Approvals, Denials Pages + Submit Form Improvements

### Overview
Upgrade the Firms, Approvals, and Denials pages with proper table views (default) and optional card views, add a Twitter link field to the submit form, and replace the plain date input with a visual calendar datepicker.

---

### 1. Add Twitter Link to payout_cases Table (Database Migration)

Add a `twitter_link` column (nullable text) to `payout_cases` so users can optionally share their Twitter post link when submitting a case.

```text
ALTER TABLE public.payout_cases ADD COLUMN twitter_link text;
```

---

### 2. Update Submit Case Form (`src/pages/SubmitCase.tsx`)

**Changes:**
- Add `twitter_link` field to form state
- Add a new optional "Twitter Link" input field with a Twitter/X icon
- Replace the plain `<Input type="date">` with a Shadcn Calendar + Popover datepicker component (visual calendar picker)
- Store selected date as formatted string in state
- Include `twitter_link` in the Supabase insert call

**New imports:** `Calendar`, `Popover`, `PopoverTrigger`, `PopoverContent`, `CalendarIcon`, `format` from date-fns, `cn` utility.

---

### 3. Revamp Firms Page (`src/pages/Firms.tsx`)

**Changes:**
- Add a view toggle (Table / Card) with icons at the top
- Default view: **Table view** with columns: Logo, Name, Approvals, Denials, Approval Rate, Rating (stars), Website, Created Date, Actions (View Details link)
- Card view: Keep existing card grid layout
- Style the table with the dark glassmorphism theme matching the site background
- Add Framer Motion fade animations for view transitions

---

### 4. Revamp Approvals Page (`src/pages/Approvals.tsx`)

**Changes:**
- Add a view toggle (Table / Card)
- Default view: **Table view** with columns: Firm Name, Amount, Payout Date, Twitter Link, Screenshot (thumbnail), Notes (truncated), Submitted Date
- Card view: Keep existing card grid
- Table styled with dark glass theme
- Show Twitter link as clickable icon if present

---

### 5. Revamp Denials Page (`src/pages/Denials.tsx`)

**Changes:**
- Same structure as Approvals page
- Add view toggle (Table / Card)
- Default view: **Table view** with matching columns
- Card view: existing card grid
- Red/pink accent for denial styling in table rows

---

### Technical Details

**Files to modify:**
1. `src/pages/SubmitCase.tsx` -- Add twitter_link field, replace date input with calendar popover
2. `src/pages/Firms.tsx` -- Add table view (default) + card view toggle
3. `src/pages/Approvals.tsx` -- Add table view (default) + card view toggle, show twitter link
4. `src/pages/Denials.tsx` -- Add table view (default) + card view toggle, show twitter link

**Database migration:**
- Add `twitter_link` text column to `payout_cases`

**Components used:**
- Existing: `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`
- Existing: `Calendar` from `@/components/ui/calendar`, `Popover` / `PopoverTrigger` / `PopoverContent`
- Existing: `Tabs`, `Button`, `Badge`, `Card`
- Icons: `LayoutGrid`, `List`, `CalendarIcon`, `Twitter` from lucide-react

**Design approach:**
- Tables use the same `glass` styling with `bg-background/60 backdrop-blur` borders
- Rows have subtle hover effects matching the dark fintech theme
- Approval rows get subtle cyan/green left border accent
- Denial rows get subtle red/pink left border accent
- View toggle buttons use outline style with active state highlighted
- Calendar popover styled with `pointer-events-auto` for proper interaction

