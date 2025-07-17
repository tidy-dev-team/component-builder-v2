import { PropGateError, ErrorCode, ErrorSeverity, ErrorContext, createError } from './types';

export interface ErrorServiceConfig {
  enableConsoleLogging: boolean;
  enableUserNotifications: boolean;
  enableTelemetry: boolean;
  maxRetries: number;
}

export class ErrorService {
  private static instance: ErrorService;
  private config: ErrorServiceConfig;
  private errorHistory: PropGateError[] = [];
  private readonly maxHistorySize = 100;

  private constructor(config: ErrorServiceConfig) {
    this.config = config;
  }

  public static getInstance(config?: ErrorServiceConfig): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService(config || {
        enableConsoleLogging: true,
        enableUserNotifications: true,
        enableTelemetry: false,
        maxRetries: 3,
      });
    }
    return ErrorService.instance;
  }

  public handleError(error: PropGateError | Error | unknown, context?: ErrorContext): PropGateError {
    let propGateError: PropGateError;

    if (error instanceof PropGateError) {
      propGateError = error;
    } else {
      propGateError = this.wrapError(error, context);
    }

    // Add to history
    this.addToHistory(propGateError);

    // Log error
    if (this.config.enableConsoleLogging) {
      this.logError(propGateError);
    }

    // Notify user
    if (this.config.enableUserNotifications && propGateError.actionable) {
      this.notifyUser(propGateError);
    }

    // Send telemetry (if enabled)
    if (this.config.enableTelemetry) {
      this.sendTelemetry(propGateError);
    }

    return propGateError;
  }

  public async handleAsyncError<T>(
    operation: () => Promise<T>,
    context?: ErrorContext,
    retryCount = 0
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      const propGateError = this.handleError(error, context);
      
      // Retry logic for recoverable errors
      if (propGateError.recoverable && retryCount < this.config.maxRetries) {
        console.log(`Retrying operation (attempt ${retryCount + 1}/${this.config.maxRetries})`);
        await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        return this.handleAsyncError(operation, context, retryCount + 1);
      }

      throw propGateError;
    }
  }

  public createComponentSetError(code: ErrorCode, message: string, context?: ErrorContext): PropGateError {
    return createError({
      code,
      message,
      severity: ErrorSeverity.HIGH,
      context,
      recoverable: this.isRecoverable(code),
      actionable: true,
    });
  }

  public createBuildError(message: string, context?: ErrorContext, cause?: Error): PropGateError {
    return createError({
      code: ErrorCode.BUILD_FAILED,
      message,
      severity: ErrorSeverity.HIGH,
      context,
      cause,
      recoverable: false,
      actionable: true,
    });
  }

  public createPropertyError(code: ErrorCode, message: string, context?: ErrorContext): PropGateError {
    return createError({
      code,
      message,
      severity: ErrorSeverity.MEDIUM,
      context,
      recoverable: false,
      actionable: true,
    });
  }

  public createValidationError(code: ErrorCode | string, message: string, context?: ErrorContext): PropGateError {
    return createError({
      code: typeof code === 'string' ? ErrorCode.VALIDATION_ERROR : code,
      message,
      severity: ErrorSeverity.LOW,
      context,
      recoverable: false,
      actionable: true,
    });
  }

  public getErrorHistory(): PropGateError[] {
    return [...this.errorHistory];
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  public getErrorStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = {};
    
    this.errorHistory.forEach(error => {
      stats[error.code] = (stats[error.code] || 0) + 1;
    });

    return stats;
  }

  private wrapError(error: unknown, context?: ErrorContext): PropGateError {
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

    return createError({
      code: ErrorCode.UNKNOWN_ERROR,
      message,
      severity: ErrorSeverity.MEDIUM,
      context,
      cause,
      recoverable: false,
      actionable: true,
    });
  }

  private addToHistory(error: PropGateError): void {
    this.errorHistory.push(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }
  }

  private logError(error: PropGateError): void {
    const logLevel = this.getLogLevel(error.severity);
    const logMessage = `[${error.code}] ${error.message}`;
    
    console[logLevel](logMessage, {
      severity: error.severity,
      context: error.context,
      timestamp: new Date(error.timestamp).toISOString(),
      stack: error.stack,
    });
  }

  private notifyUser(error: PropGateError): void {
    // Use Figma's notification system
    if (typeof figma !== 'undefined' && figma.notify) {
      figma.notify(error.userMessage, {
        error: error.severity === ErrorSeverity.HIGH || error.severity === ErrorSeverity.CRITICAL,
        timeout: this.getNotificationTimeout(error.severity),
      });
    }
  }

  private sendTelemetry(error: PropGateError): void {
    // Placeholder for telemetry implementation
    // This would send error data to analytics service
    console.log('Telemetry:', error.toJSON());
  }

  private isRecoverable(code: ErrorCode): boolean {
    const recoverableErrors = [
      ErrorCode.COMPONENT_SET_STALE,
      ErrorCode.NETWORK_ERROR,
      ErrorCode.FIGMA_API_ERROR,
    ];
    return recoverableErrors.includes(code);
  }

  private getLogLevel(severity: ErrorSeverity): 'log' | 'warn' | 'error' {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 'log';
      case ErrorSeverity.MEDIUM:
        return 'warn';
      case ErrorSeverity.HIGH:
      case ErrorSeverity.CRITICAL:
        return 'error';
      default:
        return 'log';
    }
  }

  private getNotificationTimeout(severity: ErrorSeverity): number {
    switch (severity) {
      case ErrorSeverity.LOW:
        return 3000;
      case ErrorSeverity.MEDIUM:
        return 5000;
      case ErrorSeverity.HIGH:
        return 8000;
      case ErrorSeverity.CRITICAL:
        return 10000;
      default:
        return 5000;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const errorService = ErrorService.getInstance();