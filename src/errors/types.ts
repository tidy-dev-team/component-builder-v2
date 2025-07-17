// Error type definitions for centralized error handling

export enum ErrorCode {
  // Component Set Errors
  COMPONENT_SET_NOT_FOUND = 'COMPONENT_SET_NOT_FOUND',
  COMPONENT_SET_INVALID = 'COMPONENT_SET_INVALID',
  COMPONENT_SET_STALE = 'COMPONENT_SET_STALE',
  COMPONENT_SET_REFRESH_FAILED = 'COMPONENT_SET_REFRESH_FAILED',
  
  // Property Errors
  PROPERTY_NOT_FOUND = 'PROPERTY_NOT_FOUND',
  PROPERTY_INVALID = 'PROPERTY_INVALID',
  PROPERTY_DELETION_FAILED = 'PROPERTY_DELETION_FAILED',
  
  // Variant Errors
  VARIANT_DELETION_FAILED = 'VARIANT_DELETION_FAILED',
  VARIANT_NOT_FOUND = 'VARIANT_NOT_FOUND',
  
  // Node Errors
  NODE_INVALID = 'NODE_INVALID',
  NODE_REMOVAL_FAILED = 'NODE_REMOVAL_FAILED',
  
  // Build Errors
  BUILD_FAILED = 'BUILD_FAILED',
  CLONE_FAILED = 'CLONE_FAILED',
  
  // API Errors
  FIGMA_API_ERROR = 'FIGMA_API_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // General Errors
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
}

export enum ErrorSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ErrorContext {
  [key: string]: any;
  componentName?: string;
  propertyName?: string;
  variantName?: string;
  nodeId?: string;
  userId?: string;
  timestamp?: number;
}

export interface ErrorDetails {
  code: ErrorCode;
  message: string;
  severity: ErrorSeverity;
  context?: ErrorContext;
  cause?: Error;
  recoverable?: boolean;
  userMessage?: string;
  actionable?: boolean;
}

export class PropGateError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context: ErrorContext;
  public readonly cause?: Error;
  public readonly recoverable: boolean;
  public readonly userMessage: string;
  public readonly actionable: boolean;
  public readonly timestamp: number;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = 'PropGateError';
    this.code = details.code;
    this.severity = details.severity;
    this.context = details.context || {};
    this.cause = details.cause;
    this.recoverable = details.recoverable ?? false;
    this.userMessage = details.userMessage || this.getDefaultUserMessage();
    this.actionable = details.actionable ?? false;
    this.timestamp = Date.now();
  }

  private getDefaultUserMessage(): string {
    switch (this.code) {
      case ErrorCode.COMPONENT_SET_NOT_FOUND:
        return 'Component not found. Please check if the component exists in your Figma file.';
      case ErrorCode.COMPONENT_SET_STALE:
        return 'Component is outdated. Please reselect the component from the dropdown.';
      case ErrorCode.BUILD_FAILED:
        return 'Failed to build component. Please try again.';
      case ErrorCode.CLONE_FAILED:
        return 'Failed to create component copy. Please try again.';
      case ErrorCode.PROPERTY_DELETION_FAILED:
        return 'Failed to remove property. The component may have been modified externally.';
      case ErrorCode.VARIANT_DELETION_FAILED:
        return 'Failed to remove variant. The component may have been modified externally.';
      case ErrorCode.FIGMA_API_ERROR:
        return 'Figma API error. Please check your connection and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      recoverable: this.recoverable,
      userMessage: this.userMessage,
      actionable: this.actionable,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}

// Helper function to create errors
export function createError(details: ErrorDetails): PropGateError {
  return new PropGateError(details);
}

// Helper function to wrap unknown errors
export function wrapUnknownError(error: unknown, context?: ErrorContext): PropGateError {
  if (error instanceof PropGateError) {
    return error;
  }

  let message = 'Unknown error occurred';
  let cause: Error | undefined;

  if (error instanceof Error) {
    message = error.message;
    cause = error;
  } else if (typeof error === 'string') {
    message = error;
  }

  return new PropGateError({
    code: ErrorCode.UNKNOWN_ERROR,
    message,
    severity: ErrorSeverity.MEDIUM,
    context,
    cause,
    recoverable: false,
    userMessage: 'An unexpected error occurred. Please try again.',
    actionable: true,
  });
}