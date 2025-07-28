import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface NotificationOptions {
  title?: string;
  timeOut?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultOptions: Required<NotificationOptions> = {
    title: '',
    timeOut: 5000
  };

  constructor(private toastr: ToastrService) {}

  show(message: string, type: NotificationType = 'info', options: NotificationOptions = {}) {
    const { title, timeOut } = { ...this.defaultOptions, ...options };
    
    const toast = this.toastr[type](
      message,
      title,
      { timeOut }
    );
    
    return toast;
  }

  success(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, 'success', options);
  }

  error(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, 'error', options);
  }

  info(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, 'info', options);
  }

  warning(message: string, options: Omit<NotificationOptions, 'type'> = {}) {
    return this.show(message, 'warning', options);
  }
}
