# Chore Tracker App - Complete Roadmap

## Overview
A full-stack multi-user chore tracking app for families with admin controls, earnings tracking, and payment management.

**Live URL:** https://choretracker-one.vercel.app

---

## Tech Stack

### Frontend
- React (JavaScript/JSX)
- Tailwind CSS + custom CSS
- Responsive design (mobile-first)

### Backend
- Supabase (PostgreSQL database)
- Magic link email authentication
- Row Level Security (RLS)

### Hosting & Deployment
- Vercel (auto-deploys from GitHub main branch)
- Git workflow: `git add .` → `git commit -m "msg"` → `git push`

---

## Database Structure (Supabase)

### Tables

**profiles**
- `id` - UUID (primary key)
- `email` - Text
- `name` - Text
- `role` - Text (admin/user)
- `avatar_emoji` - Text
- `avatar_color` - Text
- `total_earnings` - Numeric

**chores**
- `id` - UUID (primary key)
- `name` - Text
- `description` - Text
- `value` - Numeric (dollar amount)
- `is_recurring` - Boolean
- `can_repeat` - Boolean
- `reset_frequency` - Text (daily/weekly/monthly)
- `reset_day` - Integer
- `created_at` - Timestamp
- `created_by` - UUID (foreign key to profiles)

**completions**
- `id` - UUID (primary key)
- `chore_id` - UUID (foreign key to chores)
- `user_id` - UUID (foreign key to profiles)
- `amount_earned` - Numeric
- `completed_at` - Timestamp

### Row Level Security (RLS)
- ✅ Admins can create/edit/delete chores
- ✅ Users can create their own completions
- ✅ Everyone can view chores and completions

---

## Current Features ✅

### Authentication & Users
- Magic link email authentication
- User profiles with emoji avatars
- Custom avatar colors
- Admin vs regular user roles

### Chore Management
- Create/edit/delete chores (admin only)
- Chore properties: name, description, value ($)
- Recurring settings with reset frequency (daily/weekly/monthly)
- Repeatable chores option
- Complete chores with green fade animation + checkmark

### History & Earnings
- History page shows all completions with avatars
- Time filter (Today/This Week/This Month/All Time)
- Admin dashboard with:
  - Overview carousel (Family Summary + Pending Payouts)
  - Individual earnings cards (one per user)
  - Swipable on mobile with dots indicator
  - Responsive grid on desktop
- Admin can delete completed chores
- User-specific earnings view

### UI/UX
- iOS-style UI with rounded tab bar
- Persist active tab after refresh
- Mobile-first responsive design
- Smooth animations and transitions

---

## Web App Final Touches 🌐

**Web app will be mostly retired once iOS native ships. These final improvements support current users:**

### Phase 1: Dark Mode 🌙
**Time estimate: 2 hours**
- Auto-detect system preference (`prefers-color-scheme`)
- Manual toggle in Profile page (overrides system)
- Save preference to Supabase `profiles` table
  - Add `theme_preference` column: `'system'`, `'light'`, `'dark'` (default: `'system'`)
- CSS variables for all colors
- Smooth fade transition between modes
- Respects system changes if user hasn't manually overridden

### Phase 2: Responsive Design 📱→💻
**Time estimate: 2-3 hours**
- Improve iPad experience
- Better desktop/browser layouts
- Optimize card sizing and spacing for larger screens
- Keep mobile-first approach but enhance tablet/desktop views
- Better use of screen real estate on wide displays

**After these updates, web app development pauses. Focus shifts to iOS native.**

---

## iOS Native App 🍎

**Primary user experience for Jackson & Vivi (both iOS users). Android user (parent) continues using web app.**

### Core Features (Port from Web)
- Magic link authentication (or transition to native auth)
- Chore management (create/edit/delete)
- Complete chores
- Track earnings
- Payment tracking & history
- Role-based views (admin vs user)

### iOS Native Features & Polish
**Visual Design (NEW - not in web):**
- Modern iOS design language
- Light/neutral color palette
- Gradient cards (Family/Payouts)
- User cards with saturated avatar colors
- Colored left borders on history items
- Neutral tab indicator (gray/blue-gray)
- Glassmorphism effects

**Animations:**
- Card tap feedback
- Number counter animations
- Smooth transitions
- Button press feedback
- Modal slide-ups
- List stagger effects
- Tab transitions

**iOS-Specific:**
- Push notifications (chore reminders, payment alerts)
- Haptic feedback
- Widgets (earnings summary, pending chores)
- Apple Watch app (optional - quick chore completion)
- Native photo picker for profile pictures
- Share sheet integration
- Proper iOS navigation patterns

### Major Features (Build Native-First)
**Home Tab & Goals System:**
- Replace History tab with Home tab
- Role-aware home screen:
  - **Regular users:** Goal card, earnings summary, recent activity
  - **Admins:** Family dashboard with stats
- Goals system:
  - One active goal per user
  - Progress visualization
  - Earnings graph (30 days)
  - Projected completion date
  - Goal completion celebration
- "View All" link to full history

**Enhanced Navigation:**
- Home: Dashboard view (role-aware)
- Chores: Available chores only
- Profile: User settings
- Manage: Admin control center (admins only)

---

## Phase 3: Major Refactor - Home Tab & Goals System 🏗️
**MOVED TO iOS NATIVE - Build once, build right**
**Time estimate: 8-10 hours | Risk: High**

**3a. Restructure Navigation:**
- Add Home tab, remove History from navigation
- Home tab is role-aware:
  - **Regular users:** Goals card, earnings summary, recent activity (top 3), "View All" link
  - **Admins:** Family dashboard (current History page with colored cards)
- Chores tab: Available chores list only
- Profile tab: User settings
- Manage tab: Admin control center

**3b. Goals System:**
- Database: Add `goals` table (user_id, name, icon, target_amount, created_at)
- One active goal per user at a time
- Goal card on user Home page
- Goal detail modal with:
  - Progress visualization
  - Earnings graph (last 30 days)
  - Projected completion date
  - Edit button
- Goal creation/edit flow
- Goal completion celebration

**3c. Distributed Admin Controls:**
- Chores page: Add/edit/delete chores (swipe actions + FAB)
- Home page: Tap user card → Modal with their history + edit/delete completions
- Manage tab: Unified admin view for power users

### Phase 4: Remaining MVP Features
(After restructure is complete)

1. ✅ **Payment Tracking (COMPLETED)**
   - Modal popup for payments
   - Mark each user as paid individually
   - Track payment history
   - Clear pending amounts after payment
   - User-specific view (pending/paid summary)
   - Admin and regular user views

2. ✅ **Delete Completed Chores (COMPLETED)**
   - Admin can delete specific completions from history
   - Earnings adjust automatically

3. **Family Overview Modal**
   - Click Family Summary card to open modal
   - **Admin View:**
     - Individual goals dashboard (all users' goals + progress)
     - Create/edit goals for any user
     - Chore analytics (who does what, completion rates, fairness)
     - Identify neglected chores
   - **User View:**
     - Personal goals + progress
     - Most completed chores (top 3-5)
     - Personal stats

4. **App Settings**
   - User preferences panel
   - Notification settings
   - Display options
   - Account management

5. **Developer Mode**
   - Debug panel/console
   - Database inspection tools
   - Performance metrics
   - Feature flags for testing

6. **Notifications Bell**
   - In-app notification center
   - Badge count for unread notifications
   - Activity feed (chores completed, payments made)
   - Notification preferences

7. **Dark Mode**
   - Toggle between light/dark themes
   - Save preference per user
   - System preference detection

8. **Enhanced Animations**
   
   **Quick Wins (~30 mins each):**
   - ✅ Tab bar indicator slide - Blue bar smoothly moves between tabs (COMPLETED)
   - ✅ Page slide transitions - Content slides left/right when changing tabs (COMPLETED)
   - ✅ Button press animations - Scale down slightly on tap (COMPLETED)
   - Card tap feedback - Subtle scale/shadow on earnings card tap
   - Number counter animations - Earnings amount counts up smoothly
   - Filter dropdown smooth open - Dropdown expands smoothly
   
   **Medium Effort (~1 hour each):**
   - Modal fade in/slide up - Payment modal animates in from bottom or fades
   - Pay button ripple effect - Material-style ripple on click
   - Card entrance animations - Chore cards fade in + slide up when page loads
   - List stagger - History items appear one after another (staggered)
   - Avatar color transitions - Color changes fade smoothly in profile editor
   
   **Bigger Projects (2+ hours):**
   - Skeleton screens - Loading placeholders instead of blank page (reduces animation jank)
   - Payment success confetti - Celebration when paying someone
   - Goal reached animation - Special effect when hitting a goal
   - Completion celebration - Extra polish on chore complete

9. **Responsive Sizing Improvements**
   - Better tablet layouts
   - Desktop optimization
   - Card sizing adjustments

---

## Native Apps 📱

**iOS & Android specific features:**

### iOS App
1. Push notifications (chore reminders, payment notifications)
2. Haptic feedback
3. Widgets (earnings summary, pending chores)
4. Apple Watch app (quick chore completion, earnings at a glance)
5. Photo upload for profile pictures
6. Icon pack customization
7. Advanced settings (themes, sounds, etc.)

### Android App
*Separate item for independent prioritization*
1. Push notifications
2. Haptic feedback  
3. Home screen widgets
4. Wear OS integration
5. Photo upload for profile pictures
6. Icon pack customization
7. Advanced settings (themes, sounds, etc.)

**Note:** Photo profile pictures uploaded in native apps should sync to web app (web needs to support displaying images, not just emojis)

---

## Future Web App / Home Dashboard 🏠

**Long-term web features & family hub:**

1. **PWA Meta Tag Fix**
   - Update deprecated apple-mobile-web-app-capable meta tag
   - Replace with modern mobile-web-app-capable tag

2. **Family Goals System**
   - Shared family savings goals
   - Everyone contributes to collective goals
   - Track progress toward family rewards
   - Goal achievement celebrations

3. **Profile Picture Support**
   - Display uploaded photos from native apps
   - Support both emoji and image avatars
   - Image storage and optimization

4. **Kiosk Mode / Family Dashboard**
   - Always-on display mode
   - New "kiosk" user role in database (not admin, not regular user)
   - Generic/no personal greeting on pages
   - Read-only or limited interactions
   - Family calendar integration
   - Shared announcements
   - Large touchscreen optimization
   - Focus on displaying family stats/overview

5. **Grocery Lists**
   - Shared shopping lists
   - Category organization
   - Check-off items
   - Add items from any device

6. **Notes/Memos**
   - Family message board
   - Per-user notes
   - Shared reminders
   - Sticky note style UI

7. **Whiteboard**
   - Digital family whiteboard
   - Drawing/sketching capability
   - Photo uploads
   - Calendar/schedule view

---

## Known Issues 🐛

- [ ] Time filter dropdown alignment with cards below (mobile)
- [ ] Chore edit requires page reload (should update live)

---

## File Structure

```
chore-tracker/
├── src/
│   ├── App.js           # All React components
│   ├── App.css          # All styling
│   └── supabaseClient.js # Database config
├── public/
│   ├── manifest.json    # PWA configuration
│   └── index.html       # HTML wrapper
└── README.md
```

---

## Development Notes

### Testing Checklist
- [ ] Test on iPhone (Safari)
- [ ] Test on Android (Chrome)
- [ ] Test on Desktop web (Chrome/Safari)
- [ ] Check Supabase logs for errors

### Debugging Tools
- Browser console (Chrome DevTools)
- Supabase SQL Editor for database changes
- Vercel deployment logs

### Important Reminders
- Always save files before committing (auto-save is ON)
- Test responsive behavior at breakpoint: 768px
- Check carousel behavior on both mobile and desktop

---

## Key People
- **Admin Users:** Parents (manage chores, view all earnings)
- **Regular Users:** Jackson, Vivi (complete chores, track earnings)

---

## Git Workflow

```bash
git add .
git commit -m "description of changes"
git push
```

*Vercel auto-deploys from GitHub main branch*

---

**Last Updated:** 2025-10-13 
**Version:** MVP in production, phased refactor planned