import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  autoHide?: boolean;
  delay?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  showToast(
    message: string, 
    type: ToastMessage['type'] = 'info', 
    title?: string,
    autoHide: boolean = true,
    delay: number = 5000
  ): void {
    const toast: ToastMessage = {
      id: this.generateId(),
      message,
      type,
      title,
      autoHide,
      delay
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, toast]);
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    const filteredToasts = currentToasts.filter(toast => toast.id !== id);
    this.toastsSubject.next(filteredToasts);
  }

  // Convenience methods
  showSuccess(message: string, title?: string): void {
    this.showToast(message, 'success', title);
  }

  showError(message: string, title?: string): void {
    this.showToast(message, 'error', title); // Don't auto-hide errors
  }

  showWarning(message: string, title?: string): void {
    this.showToast(message, 'warning', title);
  }

  showInfo(message: string, title?: string): void {
    this.showToast(message, 'info', title);
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }
}