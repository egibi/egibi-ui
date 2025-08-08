import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Subscription } from "rxjs";
import { ToastService, ToastMessage } from "../../_services/toast.service";

declare var bootstrap: any;

@Component({
  selector: "toast",
  imports: [CommonModule],
  templateUrl: "./toast.component.html",
  styleUrl: "./toast.component.scss",
})
export class ToastComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild("toastContainer", { read: ElementRef }) toastContainer!: ElementRef;

  toasts: ToastMessage[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
      // Initialize new toasts after view update
      setTimeout(() => this.initializeNewToasts(), 0);
    });
  }

  ngAfterViewInit(): void {
    this.initializeNewToasts();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private initializeNewToasts(): void {
    if (typeof bootstrap !== 'undefined') {
      this.toasts.forEach(toast => {
        const toastElement = document.getElementById(`toast-${toast.id}`);
        if (toastElement && !toastElement.classList.contains('show')) {
          const bsToast = new bootstrap.Toast(toastElement);
          bsToast.show();
          
          // Listen for hidden event to remove from service
          toastElement.addEventListener('hidden.bs.toast', () => {
            this.toastService.removeToast(toast.id);
          });
        }
      });
    }
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }

  getToastClass(type: ToastMessage['type']): string {
    return `toast-${type}`;
  }

  getIconClass(type: ToastMessage['type']): string {
    const icons = {
      success: 'bi bi-check-circle-fill text-success',
      error: 'bi bi-exclamation-circle-fill text-danger',
      warning: 'bi bi-exclamation-triangle-fill text-warning',
      info: 'bi bi-info-circle-fill text-info'
    };
    return icons[type];
  }

}
