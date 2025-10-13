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

1. **Weekly Payout Tracker**
   - Modal popup for payouts
   - Mark each user as paid individually
   - Track payment history
   - Clear pending amounts after payment

2. **Delete Completed Chores (Admin)**
   - Remove specific completions from history
   - Adjust user earnings accordingly

3. **App Settings**
   - User preferences panel
   - Notification settings
   - Display options
   - Account management

4. **Developer Mode**
   - Debug panel/console
   - Database inspection tools
   - Performance metrics
   - Feature flags for testing

5. **Notifications Bell**
   - In-app notification center
   - Badge count for unread notifications
   - Activity feed (chores completed, payments made)
   - Notification preferences

6. **Dark Mode**
   - Toggle between light/dark themes
   - Save preference per user
   - System preference detection

7. **Enhanced Animations**
   - More interaction feedback
   - Page transitions (swipe-style animations between tabs)
   - Loading states
   - Smooth micro-interactions

8. **Responsive Sizing Improvements**
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

### Android App
*Separate item for independent prioritization*
1. Push notifications
2. Haptic feedback  
3. Home screen widgets
4. Wear OS integration

---

## Future Web App / Home Dashboard 🏠

**Long-term web features & family hub:**

1. **PWA Meta Tag Fix**
   - Update deprecated apple-mobile-web-app-capable meta tag
   - Replace with modern mobile-web-app-capable tag

2. **Kiosk Mode / Family Dashboard**
   - Always-on display mode
   - Family calendar integration
   - Shared announcements
   - Large touchscreen optimization

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
- [ ] Consider if "Paid" amount on payout card should respect time filter or always show total paid

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

**Last Updated:** Current session
**Version:** MVP in production, native apps and advanced features in planning