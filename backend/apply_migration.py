#!/usr/bin/env python
"""Manually apply the booking flow migration"""
from sqlalchemy import text
from config.database import engine

try:
    with engine.connect() as conn:
        # Check if columns exist first
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name IN ('quantity', 'payment_verified', 'payment_verified_at')
        """))
        existing_columns = [row[0] for row in result]
        
        if 'quantity' not in existing_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN quantity INTEGER NOT NULL DEFAULT 1"))
            print("✓ Added quantity column")
        else:
            print("• quantity column already exists")
        
        if 'payment_verified' not in existing_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN payment_verified BOOLEAN NOT NULL DEFAULT false"))
            print("✓ Added payment_verified column")
        else:
            print("• payment_verified column already exists")
        
        if 'payment_verified_at' not in existing_columns:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN payment_verified_at TIMESTAMP"))
            print("✓ Added payment_verified_at column")
        else:
            print("• payment_verified_at column already exists")
        
        # Check if admin_settings table exists
        result = conn.execute(text("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = 'admin_settings'
        """))
        table_exists = result.fetchone() is not None
        
        if not table_exists:
            conn.execute(text("""
                CREATE TABLE admin_settings (
                    id SERIAL PRIMARY KEY,
                    payment_qr_code TEXT,
                    payment_upi_id VARCHAR(255),
                    updated_at TIMESTAMP,
                    updated_by INTEGER REFERENCES users(id)
                )
            """))
            print("✓ Created admin_settings table")
        else:
            print("• admin_settings table already exists")
        
        conn.commit()
        print("\n✓ All migrations applied successfully!")
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
