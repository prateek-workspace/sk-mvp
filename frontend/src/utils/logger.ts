/**
 * Central Logging Utility for Frontend
 * 
 * Usage:
 * - Import: import logger from '@/utils/logger'
 * - Log: logger.info('Component mounted')
 * - Control via .env: VITE_ENABLE_LOGS=true
 */

const ENABLE_LOGS = import.meta.env.VITE_ENABLE_LOGS === 'true';

class Logger {
  private enabled: boolean;
  private prefix: string;

  constructor(enabled = ENABLE_LOGS) {
    this.enabled = enabled;
    this.prefix = '[PrepHub]';
  }

  /**
   * Enable or disable logging globally
   */
  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    console.log(`${this.prefix} Logging ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  /**
   * Check if logging is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * General info log
   */
  info(message: string, ...args: any[]) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [INFO]`, message, ...args);
  }

  /**
   * Component lifecycle log
   */
  lifecycle(component: string, event: string, ...args: any[]) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [LIFECYCLE] ${component}:`, event, ...args);
  }

  /**
   * User interaction log
   */
  interaction(action: string, details?: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [INTERACTION]`, action, details || '');
  }

  /**
   * API call log
   */
  api(method: string, endpoint: string, payload?: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [API] ${method.toUpperCase()}`, endpoint, payload || '');
  }

  /**
   * API response log
   */
  apiResponse(endpoint: string, status: number, data?: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [API RESPONSE]`, endpoint, `Status: ${status}`, data || '');
  }

  /**
   * Navigation log
   */
  navigation(from: string, to: string) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [NAVIGATION]`, `${from} → ${to}`);
  }

  /**
   * State change log
   */
  state(component: string, state: string, value: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [STATE] ${component}:`, state, value);
  }

  /**
   * Error log (always shown regardless of enabled flag)
   */
  error(message: string, error?: any) {
    console.error(`${this.prefix} [ERROR]`, message, error || '');
  }

  /**
   * Warning log
   */
  warn(message: string, ...args: any[]) {
    if (!this.enabled) return;
    console.warn(`${this.prefix} [WARN]`, message, ...args);
  }

  /**
   * Debug log (for detailed debugging)
   */
  debug(message: string, ...args: any[]) {
    if (!this.enabled) return;
    console.debug(`${this.prefix} [DEBUG]`, message, ...args);
  }

  /**
   * Form interaction log
   */
  form(action: string, formName: string, data?: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [FORM] ${action}:`, formName, data || '');
  }

  /**
   * Authentication log
   */
  auth(action: string, details?: any) {
    if (!this.enabled) return;
    console.log(`${this.prefix} [AUTH]`, action, details || '');
  }
}

// Create singleton instance
const logger = new Logger();

// Expose to window for manual control in console
if (typeof window !== 'undefined') {
  (window as any).logger = logger;
}

export default logger;
