// Central export for error handling system
export * from './types';
export * from './errorService';
export * from './errorRecovery';

// Re-export commonly used items
export { errorService } from './errorService';
export { errorRecovery } from './errorRecovery';
export { PropGateError, ErrorCode, ErrorSeverity, createError, wrapUnknownError } from './types';