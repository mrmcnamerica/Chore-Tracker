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

## MVP Web App 🎯

**Priority features for web version:**

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
   - Button press animations - Scale down slightly on tap
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

2. **Grocery Lists**
   - Shared shopping lists
   - Category organization
   - Check-off items
   - Add items from any device

3. **Notes/Memos**
   - Family message board
   - Per-user notes
   - Shared reminders
   - Sticky note style UI

4. **Whiteboard**
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
**Version:** MVP in production, native apps and advanced features in planning