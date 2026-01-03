# Database Setup for Authentication

## Quick Setup

To enable login functionality, you need to configure database connection.

### Option 1: Using Supabase (Recommended)

1. **Get Supabase credentials:**
   - Go to your Supabase project dashboard
   - Settings → API
   - Copy:
     - **Project URL** (e.g., `https://xxxxx.supabase.co`)
     - **service_role key** (keep this secret!)

2. **Set environment variables:**
   
   Create a `.env` file in the project root:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

   **OR** set them when running the server:
   ```bash
   SUPABASE_URL=https://xxxxx.supabase.co SUPABASE_SERVICE_ROLE_KEY=your_key node server.js
   ```

3. **Make sure your database has the `users` table:**
   - Run the migration: `supabase/migrations/002_auth_and_unavailability.sql`
   - Or ensure the `users` table exists with columns:
     - `id` (UUID or integer)
     - `email` (text, unique)
     - `password_hash` (text)
     - `name` (text)
     - `role` (text: 'ADMIN', 'DRIVER', or 'MEMBER')
     - `active` (boolean)
     - `driver_id` (nullable, for drivers)

4. **Create test users:**
   - Run: `supabase/migrations/005_create_test_users.sql`
   - Or create users manually in your database

5. **Restart the server:**
   ```bash
   node server.js
   ```

### Option 2: Direct PostgreSQL Connection

If you prefer direct PostgreSQL connection instead of Supabase:

1. **Install pg package:**
   ```bash
   npm install pg
   ```

2. **Set DATABASE_URL:**
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/dbname
   ```

3. **Uncomment PostgreSQL code in `lib/db.js`**

## Test Login

After setup, you can test with:
- **Admin:** `admin@unicabtravel.co.za` / `Admin123!`
- **Driver:** `driver@unicabtravel.co.za` / `Driver123!`
- **Member:** `member@unicabtravel.co.za` / `Member123!`

## Troubleshooting

### "Database not configured" error
- Check that `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
- Restart the server after setting environment variables
- Check server console for connection messages

### "Invalid credentials" error
- Verify user exists in database
- Check password hash is correct (use bcrypt)
- Ensure user's `active` field is `true`

### "Table 'users' does not exist"
- Run the database migrations
- Check table name matches (should be `users`, not `user`)







