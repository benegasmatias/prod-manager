export type NotificationType = 'info' | 'success' | 'warning' | 'error';
export type NotificationTargetType = 'global' | 'business' | 'role' | 'user';

export interface Notification {
    id: string;
    businessId?: string;
    userId?: string;
    title: string;
    message: string;
    type: NotificationType;
    targetType: NotificationTargetType;
    targetRole?: string;
    isRead: boolean;
    readAt?: string;
    actionUrl?: string;
    actionLabel?: string;
    createdById?: string;
    createdAt: string;
}
