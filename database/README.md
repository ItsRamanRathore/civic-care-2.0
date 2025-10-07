# Database Setup Files

## Essential SQL Scripts

### 1. clean-rls-fix.sql
- **Purpose**: Complete database setup with RLS policies
- **Usage**: Run this in Supabase SQL Editor to set up all tables and permissions
- **Status**: ✅ ACTIVE - Use this for all database setup

### 2. create-notifications-table.sql  
- **Purpose**: Creates notifications table for WhatsApp/SMS tracking
- **Usage**: Run after clean-rls-fix.sql if notifications table doesn't exist
- **Status**: ✅ ACTIVE

### 3. create-demo-users.sql
- **Purpose**: Creates demo users for testing
- **Usage**: Run to create test accounts (admin@civic.gov, citizen@civic.gov)
- **Status**: ✅ ACTIVE

## Setup Order
1. Run `clean-rls-fix.sql` first
2. Run `create-notifications-table.sql` if needed
3. Run `create-demo-users.sql` for demo accounts