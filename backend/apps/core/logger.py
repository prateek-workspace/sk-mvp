"""
Central Logging Utility for Backend

Controlled via .env: ENABLE_LOGS=true

Usage:
    from apps.core.logger import log
    
    log.info("User logged in", user_id=123)
    log.api("POST /bookings", booking_id=456)
    log.error("Database error", error=str(e))
"""

import os
from typing import Any, Dict, Optional
from datetime import datetime


class Logger:
    """Central logger that can be toggled via environment variable"""
    
    def __init__(self):
        # Read from .env file
        self.enabled = os.getenv("ENABLE_LOGS", "false").lower() == "true"
        self.prefix = "[PrepHub Backend]"
        
        if self.enabled:
            print(f"{self.prefix} Logging ENABLED")
    
    def _format_message(self, level: str, message: str, **kwargs) -> str:
        """Format log message with timestamp and kwargs"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        parts = [f"{self.prefix} [{timestamp}] [{level}] {message}"]
        
        if kwargs:
            parts.append(f" | {kwargs}")
        
        return "".join(parts)
    
    def info(self, message: str, **kwargs):
        """General info log"""
        if not self.enabled:
            return
        print(self._format_message("INFO", message, **kwargs))
    
    def lifecycle(self, component: str, event: str, **kwargs):
        """Lifecycle event log"""
        if not self.enabled:
            return
        print(self._format_message("LIFECYCLE", f"{component}: {event}", **kwargs))
    
    def api(self, message: str, **kwargs):
        """API endpoint log"""
        if not self.enabled:
            return
        print(self._format_message("API", message, **kwargs))
    
    def db(self, message: str, **kwargs):
        """Database operation log"""
        if not self.enabled:
            return
        print(self._format_message("DB", message, **kwargs))
    
    def service(self, message: str, **kwargs):
        """Service layer log"""
        if not self.enabled:
            return
        print(self._format_message("SERVICE", message, **kwargs))
    
    def auth(self, message: str, **kwargs):
        """Authentication log"""
        if not self.enabled:
            return
        print(self._format_message("AUTH", message, **kwargs))
    
    def error(self, message: str, **kwargs):
        """Error log (always shown)"""
        print(self._format_message("ERROR", message, **kwargs))
    
    def warn(self, message: str, **kwargs):
        """Warning log"""
        if not self.enabled:
            return
        print(self._format_message("WARN", message, **kwargs))
    
    def debug(self, message: str, **kwargs):
        """Debug log"""
        if not self.enabled:
            return
        print(self._format_message("DEBUG", message, **kwargs))
    
    def validation(self, message: str, **kwargs):
        """Validation log"""
        if not self.enabled:
            return
        print(self._format_message("VALIDATION", message, **kwargs))


# Create singleton instance
log = Logger()
