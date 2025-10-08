export interface IBroadcast {
  id: number;
  title: string;
  message: string;
  imageUrl: string | null;
  status: string;
  totalUsers: number | null;
  sentCount: number | null;
  errorCount: number | null;
  createdBy: string;
  cronExpression: string | null;
  isScheduled: boolean;
  isRecurring: boolean;
  created_at: string;
  updated_at: string;
}

export interface ICreateBroadcast {
  title: string;
  message: string;
  imageUrl?: string;
  createdBy: string;
  cronExpression?: string;
  isScheduled?: boolean;
  isRecurring?: boolean;
}

export interface IUpdateBroadcast {
  title?: string;
  message?: string;
  imageUrl?: string;
  status?: BroadcastStatus;
  totalUsers?: number;
  sentCount?: number;
  errorCount?: number;
  cronExpression?: string;
  isScheduled?: boolean;
  isRecurring?: boolean;
}

export type BroadcastStatus = "draft" | "sending" | "sent" | "error" | "scheduled";

export interface IBroadcastSendProgress {
  totalUsers: number;
  sentCount: number;
  errorCount: number;
  currentStatus: BroadcastStatus;
}

export interface IScheduleBroadcast {
  broadcastId: number;
  cronExpression: string;
  isRecurring?: boolean;
}