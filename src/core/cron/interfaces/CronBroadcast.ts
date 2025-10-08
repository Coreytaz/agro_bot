export interface IScheduledBroadcast {
  id: number;
  broadcastId: number;
  cronExpression: string;
  scheduledAt: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  isRecurring: boolean;
  nextRunAt?: string;
  lastRunAt?: string;
  created_at: string;
  updated_at: string;
}

export interface ICreateScheduledBroadcast {
  broadcastId: number;
  cronExpression: string;
  scheduledAt: string;
  isRecurring?: boolean;
}

export interface IBroadcastJob {
  jobId: string;
  broadcastId: number;
  cronExpression: string;
  isActive: boolean;
}

export interface ICronManagerConfig {
  timezone?: string;
  maxConcurrentJobs?: number;
  enableLogging?: boolean;
}