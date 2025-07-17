import { PropGateError, ErrorCode } from './types';
import { errorService } from './errorService';

export interface RecoveryStrategy {
  canRecover(error: PropGateError): boolean;
  recover(error: PropGateError): Promise<boolean>;
  getRecoveryMessage(error: PropGateError): string;
}

export class ComponentSetRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: PropGateError): boolean {
    return error.code === ErrorCode.COMPONENT_SET_STALE;
  }

  async recover(error: PropGateError): Promise<boolean> {
    try {
      // Emit refresh event to main thread
      if (typeof figma !== 'undefined') {
        // This would be called from UI thread
        const { emit } = await import('@create-figma-plugin/utilities');
        emit('REFRESH_COMPONENT_SET');
        return true;
      }
      return false;
    } catch (recoveryError) {
      errorService.handleError(recoveryError, {
        originalError: error.code,
        recoveryAttempt: true,
      });
      return false;
    }
  }

  getRecoveryMessage(error: PropGateError): string {
    return 'Attempting to refresh component set...';
  }
}

export class NetworkRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: PropGateError): boolean {
    return error.code === ErrorCode.NETWORK_ERROR || error.code === ErrorCode.FIGMA_API_ERROR;
  }

  async recover(error: PropGateError): Promise<boolean> {
    try {
      // Wait a bit before retrying
      await this.delay(2000);
      
      // Check if network is available (basic check)
      if (typeof navigator !== 'undefined' && navigator.onLine === false) {
        return false;
      }
      
      return true;
    } catch (recoveryError) {
      errorService.handleError(recoveryError, {
        originalError: error.code,
        recoveryAttempt: true,
      });
      return false;
    }
  }

  getRecoveryMessage(error: PropGateError): string {
    return 'Checking network connection and retrying...';
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export class PropertyRecoveryStrategy implements RecoveryStrategy {
  canRecover(error: PropGateError): boolean {
    return error.code === ErrorCode.PROPERTY_DELETION_FAILED;
  }

  async recover(error: PropGateError): Promise<boolean> {
    try {
      // For property deletion failures, we can try to continue with other properties
      // This is more of a graceful degradation than a full recovery
      console.log(`Skipping failed property: ${error.context?.propertyName}`);
      return true;
    } catch (recoveryError) {
      errorService.handleError(recoveryError, {
        originalError: error.code,
        recoveryAttempt: true,
      });
      return false;
    }
  }

  getRecoveryMessage(error: PropGateError): string {
    return `Continuing with other properties (skipped: ${error.context?.propertyName})...`;
  }
}

export class ErrorRecoveryService {
  private strategies: RecoveryStrategy[] = [
    new ComponentSetRecoveryStrategy(),
    new NetworkRecoveryStrategy(),
    new PropertyRecoveryStrategy(),
  ];

  public async attemptRecovery(error: PropGateError): Promise<boolean> {
    if (!error.recoverable) {
      return false;
    }

    const strategy = this.strategies.find(s => s.canRecover(error));
    if (!strategy) {
      return false;
    }

    try {
      // Show recovery message to user
      if (typeof figma !== 'undefined' && figma.notify) {
        figma.notify(strategy.getRecoveryMessage(error));
      }

      const recovered = await strategy.recover(error);
      
      if (recovered) {
        console.log(`Successfully recovered from error: ${error.code}`);
        if (typeof figma !== 'undefined' && figma.notify) {
          figma.notify('✓ Recovered successfully');
        }
      }
      
      return recovered;
    } catch (recoveryError) {
      errorService.handleError(recoveryError, {
        originalError: error.code,
        recoveryAttempt: true,
      });
      return false;
    }
  }

  public addStrategy(strategy: RecoveryStrategy): void {
    this.strategies.push(strategy);
  }

  public removeStrategy(strategyClass: any): void {
    this.strategies = this.strategies.filter(s => !(s instanceof strategyClass));
  }
}

export const errorRecovery = new ErrorRecoveryService();