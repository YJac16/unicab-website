# Test Login Credentials

## Test Accounts for Development

Use these credentials to test the login system once the database is connected.

### Admin Account
- **Email:** `admin@unicabtravel.co.za`
- **Password:** `Admin123!`
- **Role:** ADMIN
- **Name:** Admin User

### Driver Account
- **Email:** `driver@unicabtravel.co.za`
- **Password:** `Driver123!`
- **Role:** DRIVER
- **Name:** Driver User

### Member Account
- **Email:** `member@unicabtravel.co.za`
- **Password:** `Member123!`
- **Role:** MEMBER
- **Name:** Member User

## Important Notes

⚠️ **These are TEST credentials only!**
- Change passwords in production
- Never commit these to version control
- Use strong, unique passwords for production accounts

## How to Use

1. **Run the SQL script** (`supabase/migrations/005_create_test_users.sql`) in your database
2. **Login** using the credentials above
3. **Test** each role's dashboard and features

## Password Hashes

The SQL script includes bcrypt hashes for the passwords above. If you need to generate new hashes, use:

```bash
node scripts/create-admin.js
```

Or use Node.js directly:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YourPassword', 10).then(h => console.log(h));"
```
