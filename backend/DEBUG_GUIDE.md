# 🔍 Debug Guide: Save Meal Error 500

## Current Issue
```
ERROR createFoodEntry - error response: {"statusCode":500,"message":"Internal server error"}
ERROR Error creating food entry: [Error: Failed to create food entry]
```

## Step-by-Step Debug Process

### 1. ✅ Check Backend Server is Running
```bash
cd backend
npm run start:dev
```
**Expected**: Server should start on port 3001 without errors

### 2. ✅ Test Server Health
```bash
curl http://localhost:3001
```
**Expected**: Should return "Hello World!" or similar response

### 3. ⚠️ **CRITICAL**: Create Supabase Database Table
**This is likely the main issue!** Run this SQL in Supabase Dashboard > SQL Editor:

```sql
-- Copy content from backend/database/foods_table.sql and run it
-- This creates the 'foods' table with proper schema and RLS policies
```

### 4. ✅ Check Environment Variables
Verify in `.env` file:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 5. ✅ Test API Endpoint (Without Auth)
```bash
cd backend
npm install node-fetch
node test-api.js
```
**Expected**: Should return 401 Unauthorized (this is correct)

### 6. 🔍 Check Backend Logs
With the new debug logs, you should see detailed output when trying to save a meal from the app:

```
[DEBUG] FoodController.create - Request received
[DEBUG] FoodController.create - User: {...}
[DEBUG] FoodController.create - Body: {...}
[DEBUG] FoodService.create - Starting food creation
[DEBUG] FoodService.create - userId: xxx
[DEBUG] FoodService.create - Supabase client created
[DEBUG] FoodService.create - insertData: {...}
[DEBUG] FoodService.create - Supabase response data: {...}
[DEBUG] FoodService.create - Supabase response error: {...}
```

## Common Error Scenarios

### A. Table doesn't exist
**Error**: `relation "foods" does not exist`
**Solution**: Run the SQL script from `backend/database/foods_table.sql`

### B. RLS Policy blocks insert
**Error**: `new row violates row-level security policy`
**Solution**: Check RLS policies in Supabase Dashboard

### C. User ID mismatch
**Error**: `insert or update on table "foods" violates foreign key constraint`
**Solution**: Verify user authentication and JWT token

### D. Missing required fields
**Error**: `null value in column "xxx" violates not-null constraint`
**Solution**: Check DTO validation and required fields

### E. Environment variables missing
**Error**: `undefined` in Supabase URL/Key logs
**Solution**: Check `.env` file and restart server

## Quick Fixes to Try

1. **Restart Backend Server**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Clear TypeScript Cache**
   ```bash
   cd backend
   rm -rf dist/
   npm run build
   npm run start:dev
   ```

3. **Test with Supabase Direct Client**
   Check if you can insert data directly in Supabase dashboard

4. **Verify JWT Token**
   Make sure user is properly authenticated and token is valid

## Next Steps Based on Logs

1. **If you see "SUPABASE_URL present: false"**
   → Fix environment variable setup

2. **If you see "Table 'foods' does not exist"**
   → Run SQL script to create table

3. **If you see "RLS policy violation"**
   → Check user authentication and RLS policies

4. **If you see "Foreign key constraint"**
   → Verify user_id matches authenticated user

## Contact Points

- Check backend terminal logs for detailed debugging info
- Check Supabase Dashboard > Authentication for user data
- Check Supabase Dashboard > Table Editor for foods table
- Check Supabase Dashboard > SQL Editor to run queries 