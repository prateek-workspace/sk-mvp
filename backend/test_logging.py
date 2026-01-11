"""
Test script to demonstrate backend logging

Run with: python test_logging.py
"""

import os
import sys

# Set up path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Enable logging for this test
os.environ['ENABLE_LOGS'] = 'true'

from apps.core.logger import log

print("\n" + "="*60)
print("BACKEND LOGGING DEMONSTRATION")
print("="*60 + "\n")

print("1. Testing different log levels:\n")

log.info("This is an INFO log", module="test", status="active")
log.debug("This is a DEBUG log", query="SELECT * FROM users", duration_ms=45)
log.warn("This is a WARNING log", memory_usage="85%")
log.error("This is an ERROR log", error="Connection timeout")

print("\n2. Testing specialized loggers:\n")

log.api("POST /bookings/", user_id=123, listing_id=456)
log.service("create_booking called", user_id=123, quantity=2, amount=5000.00)
log.db("Inserting booking into database", table="bookings", id=789)
log.auth("User authenticated", user_id=123, email="user@example.com")

print("\n3. Testing with complex data:\n")

log.info("Complex data structure", 
    user={"id": 123, "email": "test@example.com"},
    booking={"id": 456, "amount": 5000, "status": "pending"}
)

print("\n" + "="*60)
print("Now try disabling logs: ENABLE_LOGS=false python test_logging.py")
print("="*60 + "\n")
