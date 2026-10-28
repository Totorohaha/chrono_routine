import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

export class HapticsService {
  /**
   * Light impact for everyday UI touches (checkbox, habit increment, tab switch)
   */
  static async light() {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(15);
        } catch {
          // Ignore
        }
      }
    }
  }

  /**
   * Medium impact for significant state changes (pause/resume, mode switch)
   */
  static async medium() {
    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(35);
        } catch {
          // Ignore
        }
      }
    }
  }

  /**
   * Success notification vibration for milestones (task completed, habit reached, timer finished)
   */
  static async success() {
    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([25, 40, 30]);
        } catch {
          // Ignore
        }
      }
    }
  }

  /**
   * Selection change tick
   */
  static async selection() {
    try {
      await Haptics.selectionChanged();
    } catch {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(10);
        } catch {
          // Ignore
        }
      }
    }
  }
}
