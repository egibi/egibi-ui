import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserManagementService, UserSummary } from './user-management.service';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  users: UserSummary[] = [];
  loading = false;
  error = '';

  // Create user form
  showCreateForm = false;
  createForm = { email: '', password: '', firstName: '', lastName: '', role: 'user' };
  creating = false;
  createError = '';

  // Edit user
  editingUser: UserSummary | null = null;
  editForm = { firstName: '', lastName: '', role: '' };
  saving = false;
  editError = '';

  // Reset password
  resetPasswordUser: UserSummary | null = null;
  newPassword = '';
  resettingPassword = false;
  resetError = '';

  // Delete user
  deletingUser: UserSummary | null = null;
  deleteConfirmEmail = '';
  deleting = false;
  deleteError = '';

  // Available roles
  roles = ['admin', 'user'];

  constructor(
    private userService: UserManagementService,
    private authService: AuthService,
    private modal: NgbModal
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  get currentUserId(): number {
    return parseInt(this.authService.user()?.sub || '0', 10);
  }

  // =============================================
  // LOAD USERS
  // =============================================

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.userService.getUsers().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.responseCode === 200) {
          this.users = res.responseData || [];
        } else {
          this.error = res.responseMessage || 'Failed to load users';
        }
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Failed to load users';
        console.error('Load users error:', err);
      }
    });
  }

  // =============================================
  // CREATE USER
  // =============================================

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.createForm = { email: '', password: '', firstName: '', lastName: '', role: 'user' };
      this.createError = '';
    }
  }

  get canCreate(): boolean {
    return !!this.createForm.email.trim() && !!this.createForm.password.trim() && !this.creating;
  }

  createUser(): void {
    if (!this.canCreate) return;
    this.creating = true;
    this.createError = '';

    this.userService.createUser({
      email: this.createForm.email.trim(),
      password: this.createForm.password,
      firstName: this.createForm.firstName.trim() || undefined,
      lastName: this.createForm.lastName.trim() || undefined,
      role: this.createForm.role
    }).subscribe({
      next: (res) => {
        this.creating = false;
        if (res.responseCode === 201) {
          this.showCreateForm = false;
          this.loadUsers();
        } else {
          this.createError = res.responseMessage || 'Failed to create user';
        }
      },
      error: (err) => {
        this.creating = false;
        this.createError = err.error?.responseMessage || 'Failed to create user';
      }
    });
  }

  // =============================================
  // EDIT USER
  // =============================================

  startEdit(user: UserSummary): void {
    this.editingUser = user;
    this.editForm = {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role
    };
    this.editError = '';
  }

  cancelEdit(): void {
    this.editingUser = null;
    this.editError = '';
  }

  saveEdit(): void {
    if (!this.editingUser || this.saving) return;
    this.saving = true;
    this.editError = '';

    this.userService.updateUser(this.editingUser.id, {
      firstName: this.editForm.firstName.trim(),
      lastName: this.editForm.lastName.trim(),
      role: this.editForm.role
    }).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.responseCode === 200) {
          this.editingUser = null;
          this.loadUsers();
        } else {
          this.editError = res.responseMessage || 'Failed to update user';
        }
      },
      error: (err) => {
        this.saving = false;
        this.editError = err.error?.responseMessage || 'Failed to update user';
      }
    });
  }

  // =============================================
  // DEACTIVATE / REACTIVATE
  // =============================================

  toggleActive(user: UserSummary): void {
    if (user.id === this.currentUserId) return;

    const action$ = user.isActive
      ? this.userService.deactivateUser(user.id)
      : this.userService.reactivateUser(user.id);

    action$.subscribe({
      next: (res) => {
        if (res.responseCode === 200) {
          this.loadUsers();
        } else {
          this.error = res.responseMessage || 'Action failed';
        }
      },
      error: () => {
        this.error = 'Failed to update user status';
      }
    });
  }

  // =============================================
  // RESET PASSWORD
  // =============================================

  startResetPassword(user: UserSummary): void {
    this.resetPasswordUser = user;
    this.newPassword = '';
    this.resetError = '';
  }

  cancelResetPassword(): void {
    this.resetPasswordUser = null;
    this.newPassword = '';
    this.resetError = '';
  }

  confirmResetPassword(): void {
    if (!this.resetPasswordUser || !this.newPassword.trim() || this.resettingPassword) return;
    this.resettingPassword = true;
    this.resetError = '';

    this.userService.resetPassword(this.resetPasswordUser.id, this.newPassword).subscribe({
      next: (res) => {
        this.resettingPassword = false;
        if (res.responseCode === 200) {
          this.resetPasswordUser = null;
          this.newPassword = '';
        } else {
          this.resetError = res.responseMessage || 'Failed to reset password';
        }
      },
      error: (err) => {
        this.resettingPassword = false;
        this.resetError = err.error?.responseMessage || 'Failed to reset password';
      }
    });
  }

  // =============================================
  // DELETE USER (permanent)
  // =============================================

  startDelete(user: UserSummary): void {
    this.deletingUser = user;
    this.deleteConfirmEmail = '';
    this.deleteError = '';
  }

  cancelDelete(): void {
    this.deletingUser = null;
    this.deleteConfirmEmail = '';
    this.deleteError = '';
  }

  get canConfirmDelete(): boolean {
    return !!this.deletingUser
      && this.deleteConfirmEmail === this.deletingUser.email
      && !this.deleting;
  }

  confirmDelete(): void {
    if (!this.canConfirmDelete) return;
    this.deleting = true;
    this.deleteError = '';

    this.userService.deleteUser(this.deletingUser!.id).subscribe({
      next: (res) => {
        this.deleting = false;
        if (res.responseCode === 200) {
          this.deletingUser = null;
          this.deleteConfirmEmail = '';
          this.loadUsers();
        } else {
          this.deleteError = res.responseMessage || 'Failed to delete user';
        }
      },
      error: (err) => {
        this.deleting = false;
        this.deleteError = err.error?.responseMessage || 'Failed to delete user';
      }
    });
  }

  // =============================================
  // HELPERS
  // =============================================

  onCreateRoleChange(): void {
    if (this.createForm.role === 'admin') {
      this.createForm.firstName = '';
      this.createForm.lastName = '';
    }
  }

  onEditRoleChange(): void {
    if (this.editForm.role === 'admin') {
      this.editForm.firstName = '';
      this.editForm.lastName = '';
    }
  }

  get activeUsers(): number {
    return this.users.filter(u => u.isActive).length;
  }

  get adminCount(): number {
    return this.users.filter(u => u.role === 'admin' && u.isActive).length;
  }
}
