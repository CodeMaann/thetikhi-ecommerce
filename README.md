# The Tikhi App

## Database Setup

1. Add your Neon Postgres connection string to `.env`:
   `DATABASE_URL="postgresql://user:pass@host/db?sslmode=require&pgbouncer=true"`
2. Create tables in the database:
   ```bash
   npm run db:migrate
   ```
3. Seed the database (creates admin user and initial products):
   ```bash
   npm run db:seed
   ```

## ⚠️ Database Safety

This project uses Neon Postgres via Prisma. Schema changes must go through `npm run db:migrate` (which runs `prisma migrate dev`), **never** `npm run db:push` once real data exists. The `db:push` command can silently drop columns or tables containing real data if it detects schema conflicts. 

Always run the backup script (`npm run db:backup`) before making any schema-affecting changes or requests to AI Studio in the future.
