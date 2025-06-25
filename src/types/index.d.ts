declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  export default Icon;
}

declare module 'react-native-push-notification' {
  export interface PushNotificationPermissions {
    alert?: boolean;
    badge?: boolean;
    sound?: boolean;
  }

  export interface PushNotificationOptions {
    onRegister?: (token: { os: string; token: string }) => void;
    onNotification?: (notification: any) => void;
    onAction?: (notification: any) => void;
    onRegistrationError?: (error: any) => void;
    permissions?: PushNotificationPermissions;
    popInitialNotification?: boolean;
    requestPermissions?: boolean;
  }

  export interface LocalNotificationOptions {
    id?: string | number;
    title?: string;
    message: string;
    playSound?: boolean;
    soundName?: string;
    number?: string | number;
    repeatType?: 'week' | 'day' | 'hour' | 'minute' | 'time';
    actions?: string[];
    userInfo?: any;
    foreground?: boolean;
    autoCancel?: boolean;
    largeIcon?: string;
    smallIcon?: string;
    bigText?: string;
    subText?: string;
    color?: string;
    vibrate?: boolean;
    vibration?: number;
    tag?: string;
    group?: string;
    ongoing?: boolean;
    priority?: 'max' | 'high' | 'low' | 'min' | 'default';
    visibility?: 'private' | 'public' | 'secret';
    importance?: 'default' | 'max' | 'high' | 'low' | 'min' | 'none' | 'unspecified';
    allowWhileIdle?: boolean;
    ignoreInForeground?: boolean;
    shortcutId?: string;
    channelId?: string;
    onlyAlertOnce?: boolean;
    messageId?: string;
    invokeApp?: boolean;
    when?: number;
    usesChronometer?: boolean;
    timeoutAfter?: number;
    date?: Date;
  }

  export interface ChannelOptions {
    channelId: string;
    channelName: string;
    channelDescription?: string;
    playSound?: boolean;
    soundName?: string;
    importance?: number;
    vibrate?: boolean;
  }

  export enum Importance {
    DEFAULT = 3,
    HIGH = 4,
    LOW = 2,
    MIN = 1,
    NONE = 0,
    UNSPECIFIED = -1000,
    MAX = 5
  }

  class PushNotification {
    static configure(options: PushNotificationOptions): void;
    static localNotification(options: LocalNotificationOptions): void;
    static localNotificationSchedule(options: LocalNotificationOptions): void;
    static cancelLocalNotification(id: string | number): void;
    static cancelAllLocalNotifications(): void;
    static setApplicationIconBadgeNumber(number: number): void;
    static checkPermissions(callback: (permissions: PushNotificationPermissions) => void): void;
    static requestPermissions(): Promise<PushNotificationPermissions>;
    static createChannel(options: ChannelOptions, callback?: (created: boolean) => void): void;
  }

  export default PushNotification;
}
