# nm82 Database Setup Guide

## ⚠️ Important: Direct Database Connection Blocked

The Prisma CLI cannot connect directly to your Supabase database from this machine due to network/firewall restrictions. This is common with Supabase and requires manual SQL execution via the Supabase Dashboard.

---

## 📋 Setup Steps

Follow these steps in order to set up your database:

### Step 1: Create Database Tables

1. Open your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `ojlzvjnulppspqpuruqw`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **+ New query**
5. Copy the contents of `init-schema.sql` (this directory)
6. Paste into the SQL Editor
7. Click **Run** (or press Ctrl/Cmd + Enter)
8. ✅ **Verify**: Go to **Database** → **Tables**. You should see all tables created:
   - `user_roles`
   - `pessoas_fisicas`
   - `afiliados`
   - `codigos_convite`
   - `pagamentos`
   - `emails`
   - `email_attachments`
   - `notifications`
   - `audit_logs`

---

### Step 2: Apply Row Level Security (RLS) Policies

1. Still in **SQL Editor**, click **+ New query** again
2. Copy the contents of `rls-policies.sql` (this directory)
3. Paste into the SQL Editor
4. Click **Run**
5. ✅ **Verify**: Run this query to see all policies:
   ```sql
   SELECT tablename, policyname
   FROM pg_policies
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
6. You should see policies like:
   - "Admins can see all pessoas_fisicas"
   - "Padrinhos can see own record and afiliados"
   - etc.

---

### Step 3: Create Initial Seed Data (Admin User)

1. **Create an admin user in Supabase Auth**:
   - Go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Email: `admin@inema.vip` (or your preferred admin email)
   - Password: Choose a strong password
   - Click **Create user**
   - **Copy the User ID** (UUID format: e.g., `12345678-1234-1234-1234-123456789abc`)

2. **Assign ADMIN role to the user**:
   - Go to **SQL Editor** → **+ New query**
   - Run this query (replace `YOUR_USER_ID` with the copied UUID):
   ```sql
   -- Insert admin role for your user
   INSERT INTO user_roles (id, "userId", role, "createdAt")
   VALUES (
     gen_random_uuid()::text,
     'YOUR_USER_ID',  -- Replace with your actual user UUID
     'ADMIN',
     NOW()
   );
   ```
   - Click **Run**

3. **Create sample códigos de convite** (optional but recommended):
   ```sql
   -- Generate 10 sample convite codes
   INSERT INTO codigos_convite (id, codigo, usado, "data_expiracao", "created_at")
   SELECT
     gen_random_uuid()::text,
     UPPER(SUBSTRING(MD5(RANDOM()::TEXT), 1, 8)),
     false,
     NOW() + INTERVAL '90 days',
     NOW()
   FROM generate_series(1, 10);
   ```
   - Click **Run**

---

### Step 4: Generate Prisma Client

Now that tables exist in the database, generate the Prisma Client:

```bash
cd packages/database
npx prisma generate
```

This creates the TypeScript types and client code based on your schema.

---

### Step 5: Verify Connection from App

Run the Next.js dev server to verify everything works:

```bash
# From project root
npm run dev
```

Try to log in with your admin credentials at: http://localhost:3000/auth/login

If login succeeds and you see the dashboard, **setup is complete!** ✅

---

## 🔧 Troubleshooting

### Problem: "User not found" when logging in

**Solution**: Make sure you:
1. Created the user in **Authentication** → **Users**
2. Added the user's role in `user_roles` table via SQL (Step 3.2)

### Problem: "Permission denied" errors

**Solution**: RLS policies might not be applied correctly.
- Re-run `rls-policies.sql` in SQL Editor
- Check if policies exist: `SELECT * FROM pg_policies WHERE schemaname = 'public';`

### Problem: Cannot connect to database from Prisma

**Solution**: This is expected due to network restrictions. Always use the Supabase Dashboard SQL Editor for schema changes.

---

## 📝 Next Steps After Setup

Once database is set up and admin login works:

1. **Test the auth flow**: Login → Should see dashboard
2. **Check data**: Dashboard cards should load (currently showing "-" because no data yet)
3. **Continue development**: Implement API routes for real data

---

## 🔗 Quick Links

- **Supabase Dashboard**: https://supabase.com/dashboard/project/ojlzvjnulppspqpuruqw
- **SQL Editor**: https://supabase.com/dashboard/project/ojlzvjnulppspqpuruqw/sql
- **Auth Users**: https://supabase.com/dashboard/project/ojlzvjnulppspqpuruqw/auth/users
- **Database Tables**: https://supabase.com/dashboard/project/ojlzvjnulppspqpuruqw/database/tables

---

**Last Updated**: 2025-11-01
**Status**: Awaiting manual execution of SQL scripts
