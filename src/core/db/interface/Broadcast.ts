export interface IBroadcastMedia {
  type: "photo" | "video" | "audio" | "document" | "voice" | "video_note" | "animation";
  url: string;
  caption?: string;
  fileId?: string; // Telegram file_id для уже загруженных файлов
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
}

export interface IBroadcast {
  id: number;
  title: string;
  message: string;
  media: IBroadcastMedia[] | null;
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
  media?: IBroadcastMedia[];
  createdBy: string;
  status?: BroadcastStatus;
  cronExpression?: string;
  isScheduled?: boolean;
  isRecurring?: boolean;
}

export interface IUpdateBroadcast {
  title?: string;
  message?: string;
  media?: IBroadcastMedia[];
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