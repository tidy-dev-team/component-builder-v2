import { describe, it, expect } from 'vitest';
import { PropGateError, ErrorCode, ErrorSeverity, createError, wrapUnknownError } from '../../errors/types';

describe('PropGateError', () => {
  it('should create error with required properties', () => {
    const error = new PropGateError({
      code: ErrorCode.COMPONENT_SET_NOT_FOUND,
      message: 'Component not found',
      severity: ErrorSeverity.HIGH,
    });

    expect(error.code).toBe(ErrorCode.COMPONENT_SET_NOT_FOUND);
    expect(error.message).toBe('Component not found');
    expect(error.severity).toBe(ErrorSeverity.HIGH);
    expect(error.recoverable).toBe(false);
    expect(error.actionable).toBe(false);
    expect(error.timestamp).toBeTypeOf('number');
    expect(error.context).toEqual({});
  });

  it('should create error with optional properties', () => {
    const cause = new Error('Original error');
    const context = { componentKey: 'test-key' };
    
    const error = new PropGateError({
      code: ErrorCode.BUILD_FAILED,
      message: 'Build failed',
      severity: ErrorSeverity.MEDIUM,
      context,
      cause,
      recoverable: true,
      userMessage: 'Custom user message',
      actionable: true,
    });

    expect(error.context).toBe(context);
    expect(error.cause).toBe(cause);
    expect(error.recoverable).toBe(true);
    expect(error.userMessage).toBe('Custom user message');
    expect(error.actionable).toBe(true);
  });

  it('should generate default user messages', () => {
    const testCases = [
      {
        code: ErrorCode.COMPONENT_SET_NOT_FOUND,
        expected: 'Component not found. Please check if the component exists in your Figma file.',
      },
      {
        code: ErrorCode.COMPONENT_SET_STALE,
        expected: 'Component is outdated. Please reselect the component from the dropdown.',
      },
      {
        code: ErrorCode.BUILD_FAILED,
        expected: 'Failed to build component. Please try again.',
      },
      {
        code: ErrorCode.UNKNOWN_ERROR,
        expected: 'An unexpected error occurred. Please try again.',
      },
    ];

    testCases.forEach(({ code, expected }) => {
      const error = new PropGateError({
        code,
        message: 'Test message',
        severity: ErrorSeverity.MEDIUM,
      });

      expect(error.userMessage).toBe(expected);
    });
  });

  it('should serialize to JSON correctly', () => {
    const error = new PropGateError({
      code: ErrorCode.PROPERTY_NOT_FOUND,
      message: 'Property not found',
      severity: ErrorSeverity.LOW,
      context: { propertyName: 'test-prop' },
    });

    const json = error.toJSON();

    expect(json).toEqual({
      name: 'PropGateError',
      message: 'Property not found',
      code: ErrorCode.PROPERTY_NOT_FOUND,
      severity: ErrorSeverity.LOW,
      context: { propertyName: 'test-prop' },
      recoverable: false,
      userMessage: expect.any(String),
      actionable: false,
      timestamp: expect.any(Number),
      stack: expect.any(String),
    });
  });
});

describe('createError', () => {
  it('should create PropGateError instance', () => {
    const error = createError({
      code: ErrorCode.VALIDATION_ERROR,
      message: 'Validation failed',
      severity: ErrorSeverity.LOW,
    });

    expect(error).toBeInstanceOf(PropGateError);
    expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
  });
});

describe('wrapUnknownError', () => {
  it('should return PropGateError as-is', () => {
    const originalError = new PropGateError({
      code: ErrorCode.BUILD_FAILED,
      message: 'Build failed',
      severity: ErrorSeverity.HIGH,
    });

    const result = wrapUnknownError(originalError);

    expect(result).toBe(originalError);
  });

  it('should wrap regular Error instances', () => {
    const originalError = new Error('Something went wrong');
    const context = { operation: 'test' };

    const result = wrapUnknownError(originalError, context);

    expect(result).toBeInstanceOf(PropGateError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe('Something went wrong');
    expect(result.cause).toBe(originalError);
    expect(result.context).toBe(context);
  });

  it('should wrap string errors', () => {
    const result = wrapUnknownError('String error');

    expect(result).toBeInstanceOf(PropGateError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe('String error');
    expect(result.cause).toBeUndefined();
  });

  it('should wrap unknown types', () => {
    const result = wrapUnknownError(null);

    expect(result).toBeInstanceOf(PropGateError);
    expect(result.code).toBe(ErrorCode.UNKNOWN_ERROR);
    expect(result.message).toBe('Unknown error occurred');
  });
});