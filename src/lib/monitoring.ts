import { logger } from './logger';

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
}

interface AlertConfig {
  cpuThreshold: number;
  memoryThreshold: number;
  diskThreshold: number;
  checkInterval: number;
}

class Monitoring {
  private static instance: Monitoring;
  private metrics: SystemMetrics = {
    cpu: 0,
    memory: 0,
    disk: 0,
    uptime: 0,
  };
  private config: AlertConfig = {
    cpuThreshold: 80, // 80% CPU usage
    memoryThreshold: 85, // 85% memory usage
    diskThreshold: 90, // 90% disk usage
    checkInterval: 60000, // 1 minute
  };
  private checkInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): Monitoring {
    if (!Monitoring.instance) {
      Monitoring.instance = new Monitoring();
    }
    return Monitoring.instance;
  }

  async startMonitoring() {
    if (this.checkInterval) {
      return;
    }

    this.checkInterval = setInterval(async () => {
      await this.checkSystemHealth();
    }, this.config.checkInterval);

    logger.info('System monitoring started');
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
      logger.info('System monitoring stopped');
    }
  }

  private async checkSystemHealth() {
    try {
      // In a real implementation, you would collect actual system metrics
      // For now, we'll simulate some metrics
      this.metrics = {
        cpu: Math.random() * 100,
        memory: Math.random() * 100,
        disk: Math.random() * 100,
        uptime: process.uptime(),
      };

      this.checkThresholds();
    } catch (error) {
      logger.error('Error checking system health', error as Error);
    }
  }

  private checkThresholds() {
    const alerts = [];

    if (this.metrics.cpu > this.config.cpuThreshold) {
      alerts.push(`High CPU usage: ${this.metrics.cpu.toFixed(2)}%`);
    }

    if (this.metrics.memory > this.config.memoryThreshold) {
      alerts.push(`High memory usage: ${this.metrics.memory.toFixed(2)}%`);
    }

    if (this.metrics.disk > this.config.diskThreshold) {
      alerts.push(`High disk usage: ${this.metrics.disk.toFixed(2)}%`);
    }

    if (alerts.length > 0) {
      this.sendAlert(alerts.join(', '));
    }
  }

  private sendAlert(message: string) {
    logger.warn('System Alert', { message, metrics: this.metrics });

    // In production, you would send alerts to your monitoring service
    // Example: sendToMonitoringService(message, this.metrics);
  }

  getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  updateConfig(newConfig: Partial<AlertConfig>) {
    this.config = { ...this.config, ...newConfig };
    logger.info('Monitoring configuration updated', { newConfig });
  }
}

export const monitoring = Monitoring.getInstance(); 