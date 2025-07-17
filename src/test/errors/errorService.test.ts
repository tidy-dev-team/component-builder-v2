import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ErrorService } from '../../errors/errorService';
import { ErrorCode, ErrorSeverity, PropGateError } from '../../errors/types';

describe('ErrorService', () => {
  let errorService: ErrorService;

  beforeEach(() => {
    errorService = ErrorService.getInstance({
      enableConsoleLogging: false,
      enableUserNotifications: false,
      enableTelemetry: false,
      maxRetries: 3,
    });
    errorService.clearErrorHistory();
  });

  describe('handleError', () => {
    it('should handle PropGateError instances', () => {
      const error = new PropGateError({
        code: ErrorCode.COMPONENT_SET_NOT_FOUND,
        message: 'Component not found',
        severity: ErrorSeverity.HIGH,
      });

      const result = errorService.handleError(error);

      expect(result).toBe(error);
      expect(errorService.getErrorHistory()).toHaveLength(1);
    });

    it('should wrap unknown errors', () => {
      const error = new Error('Something went wrong');

      const result = errorService.handleError(error);

      expect(result).toBeInstanceOf(PropGateError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('Something went wrong');
      expect(result.cause).toBe(error);
    });

    it('should handle string errors', () => {
      const error = 'String error message';

      const result = errorService.handleError(error);

      expect(result).toBeInstanceOf(PropGateError);
      expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(result.message).toBe('String error message');
    });
  });

  describe('handleAsyncError', () => {
    it('should handle successful operations', async () => {
      const operation = vi.fn().mockResolvedValue('success');

      const result = await errorService.handleAsyncError(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should handle failed operations', async () => {
      const operation = vi.fn().mockRejectedValue(new Error('Operation failed'));

      await expect(errorService.handleAsyncError(operation)).rejects.toThrow(PropGateError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it('should retry recoverable errors', async () => {
      const operation = vi.fn()
        .mockRejectedValueOnce(new PropGateError({
          code: ErrorCode.NETWORK_ERROR,
          message: 'Network error',
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
        }))
        .mockResolvedValue('success');

      const result = await errorService.handleAsyncError(operation);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe('createComponentSetError', () => {
    it('should create component set error with correct properties', () => {
      const error = errorService.createComponentSetError(
        ErrorCode.COMPONENT_SET_NOT_FOUND,
        'Component not found',
        { componentKey: 'test-key' }
      );

      expect(error.code).toBe(ErrorCode.COMPONENT_SET_NOT_FOUND);
      expect(error.message).toBe('Component not found');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context?.componentKey).toBe('test-key');
      expect(error.actionable).toBe(true);
    });
  });

  describe('createBuildError', () => {
    it('should create build error with correct properties', () => {
      const cause = new Error('Build failed');
      const error = errorService.createBuildError(
        'Failed to build component',
        { operation: 'BUILD' },
        cause
      );

      expect(error.code).toBe(ErrorCode.BUILD_FAILED);
      expect(error.message).toBe('Failed to build component');
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context?.operation).toBe('BUILD');
      expect(error.cause).toBe(cause);
      expect(error.recoverable).toBe(false);
    });
  });

  describe('getErrorStats', () => {
    it('should return error statistics', () => {
      // Add some errors to history
      errorService.handleError(new PropGateError({
        code: ErrorCode.COMPONENT_SET_NOT_FOUND,
        message: 'Test 1',
        severity: ErrorSeverity.HIGH,
      }));
      
      errorService.handleError(new PropGateError({
        code: ErrorCode.COMPONENT_SET_NOT_FOUND,
        message: 'Test 2',
        severity: ErrorSeverity.HIGH,
      }));
      
      errorService.handleError(new PropGateError({
        code: ErrorCode.BUILD_FAILED,
        message: 'Test 3',
        severity: ErrorSeverity.HIGH,
      }));

      const stats = errorService.getErrorStats();

      expect(stats[ErrorCode.COMPONENT_SET_NOT_FOUND]).toBe(2);
      expect(stats[ErrorCode.BUILD_FAILED]).toBe(1);
    });
  });
});