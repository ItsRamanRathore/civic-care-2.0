# Migration Instructions

## Complete Setup Guide for Civic Issue Reporting Platform

### Prerequisites
- Supabase account and project
- Twilio account (for WhatsApp notifications)
- Node.js and npm installed

### 1. Database Setup

#### Step 1: Run Main Database Setup
1. Open Supabase Dashboard → SQL Editor
2. Copy and paste content from `database/clean-rls-fix.sql`
3. Click "Run" - this creates all tables and RLS policies

#### Step 2: Create Notifications Table
1. Copy and paste content from `database/create-notifications-table.sql`
2. Click "Run" - this creates the notifications tracking table

#### Step 3: Setup User Profiles
1. Copy and paste content from `database/create-demo-users.sql`
2. Click "Run" - this creates user profile system and triggers

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio WhatsApp Configuration
VITE_TWILIO_ACCOUNT_SID=your_twilio_account_sid
VITE_TWILIO_AUTH_TOKEN=your_twilio_auth_token
VITE_TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
VITE_TWILIO_PHONE_NUMBER=your_twilio_phone_number
VITE_ADMIN_PHONE_NUMBER=+919876543210
```

### 3. Application Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Testing

#### Test User Registration
1. Go to `/signup`
2. Create a new account
3. Verify user profile is created in Supabase

#### Test Issue Submission
1. Log in with created account
2. Go to `/issue-reporting-form`
3. Fill out and submit an issue
4. Verify issue appears in `/public-reports-listing`

#### Test WhatsApp Notifications
1. Ensure phone number is provided during signup
2. Submit an issue
3. Check for WhatsApp notification

### 5. Admin Setup

#### Create Admin User
1. Sign up normally through the UI
2. In Supabase Dashboard → Table Editor → user_profiles
3. Find your user and change `role` to `admin`
4. Log out and log back in
5. You should now see admin dashboard at `/admin-dashboard`

### 6. Troubleshooting

#### Common Issues:
- **"Permission denied"**: Run `database/clean-rls-fix.sql`
- **"Failed to fetch"**: Check if Supabase project is paused
- **No WhatsApp notifications**: Verify Twilio credentials in `.env`
- **User profile not created**: Ensure triggers are set up correctly

#### Database Reset:
If you need to reset the database:
1. Drop all tables in Supabase
2. Re-run all SQL scripts in order
3. Clear browser cache and localStorage

### 7. Production Deployment

#### Environment Variables:
- Set all environment variables in your hosting platform
- Ensure Supabase project is on a paid plan for production use
- Configure proper domain settings in Supabase

#### Security:
- Review and tighten RLS policies as needed
- Set up proper backup procedures
- Monitor usage and performance

### 8. Features Included

✅ User registration and authentication
✅ Issue reporting with image upload
✅ WhatsApp notifications via Twilio
✅ Admin dashboard for issue management
✅ Public reports listing
✅ Role-based access control
✅ Real-time updates
✅ Mobile-responsive design

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the WhatsApp setup guide in `docs/WHATSAPP_SETUP_GUIDE.md`
3. Verify database setup with the SQL scripts in `database/`