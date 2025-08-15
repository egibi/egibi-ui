import { Injectable, ComponentRef, ViewContainerRef, Type } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { Observable, Subject } from "rxjs";

export interface ModalConfig {
  size?: "sm" | "lg" | "xl";
  centered?: boolean;
  backdrop?: boolean | "static";
  keyboard?: boolean;
  windowClass?: string;
  backdropClass?: string;
  scrollable?: boolean;
}

export interface ModalResult<T = any> {
  result?: T;
  dismissed?: boolean;
  reason?: string;
}

@Injectable({
  providedIn: "root",
})
export class NgbGlobalModalService {
  private modalRefs: Map<string, NgbModalRef> = new Map();

  constructor(private ngbModal: NgbModal) {}

  /**
   * Opens a modal with a custom component
   */
  openModal<T, R = any>(component: Type<T>, config: ModalConfig = {}, data?: any, modalId?: string): Observable<ModalResult<R>> {
    const resultSubject = new Subject<ModalResult<R>>();

    try {
      const modalRef = this.ngbModal.open(component, {
        size: config.size || "lg",
        centered: config.centered ?? true,
        backdrop: config.backdrop ?? true,
        keyboard: config.keyboard ?? true,
        windowClass: config.windowClass || "",
        backdropClass: config.backdropClass || "",
        scrollable: config.scrollable ?? false,
      });

      // Pass data to the component if provided
      if (data) {
        Object.assign(modalRef.componentInstance, data);
      }

      // Store modal reference if ID is provided
      if (modalId) {
        this.modalRefs.set(modalId, modalRef);
      }

      // Handle modal result
      modalRef.result
        .then((result: R) => {
          resultSubject.next({ result });
          resultSubject.complete();
          if (modalId) {
            this.modalRefs.delete(modalId);
          }
        })
        .catch((reason: any) => {
          resultSubject.next({
            dismissed: true,
            reason: reason,
          });
          resultSubject.complete();
          if (modalId) {
            this.modalRefs.delete(modalId);
          }
        });
    } catch (error) {
      resultSubject.error(error);
    }

    return resultSubject.asObservable();
  }

  /**
   * Close a specific modal by ID
   */
  closeModal(modalId: string, result?: any): void {
    const modalRef = this.modalRefs.get(modalId);
    if (modalRef) {
      modalRef.close(result);
      this.modalRefs.delete(modalId);
    }
  }

  /**
   * Dismiss a specific modal by ID
   */
  dismissModal(modalId: string, reason?: string): void {
    const modalRef = this.modalRefs.get(modalId);
    if (modalRef) {
      modalRef.dismiss(reason);
      this.modalRefs.delete(modalId);
    }
  }

  /**
   * Close all open modals
   */
  closeAllModals(): void {
    this.modalRefs.forEach((modalRef) => {
      modalRef.close();
    });
    this.modalRefs.clear();
  }

  /**
   * Check if a modal is open
   */
  isModalOpen(modalId: string): boolean {
    return this.modalRefs.has(modalId);
  }

  /**
   * Get count of open modals
   */
  getOpenModalCount(): number {
    return this.modalRefs.size;
  }
}
