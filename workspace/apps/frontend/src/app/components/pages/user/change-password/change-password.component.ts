import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '@/app/services/auth.service';
import { NotificationService } from '@/app/services/notification.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './change-password.component.html',
  styles: []
})
export class ChangePasswordComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  passwordForm: FormGroup;
  isSubmitting = false;
  showCurrentPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService,
    private location: Location
  ) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.hasUpperCase,
        this.hasLowerCase,
        this.hasNumeric,
        this.hasSpecialChar
      ]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.passwordMatchValidator });
  }

  // Custom validators as separate functions
  hasUpperCase(control: any) {
    const hasUpper = /[A-Z]/.test(control.value);
    return hasUpper ? null : { uppercase: true };
  }

  hasLowerCase(control: any) {
    const hasLower = /[a-z]/.test(control.value);
    return hasLower ? null : { lowercase: true };
  }

  hasNumeric(control: any) {
    const hasNum = /[0-9]/.test(control.value);
    return hasNum ? null : { numeric: true };
  }

  hasSpecialChar(control: any) {
    const hasSpecial = /[^A-Za-z0-9]/.test(control.value);
    return hasSpecial ? null : { specialChar: true };
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  @ViewChild('form') form: any;

  async onSubmit() {
    // Mark all controls as touched to show validation messages
    Object.keys(this.passwordForm.controls).forEach(key => {
      const control = this.passwordForm.get(key);
      if (control) {
        control.markAsTouched();
        control.markAsDirty();
        control.updateValueAndValidity();
      }
    });

    if (this.passwordForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    try {
      const { currentPassword, newPassword } = this.passwordForm.value;
      await firstValueFrom(this.authService.changePassword({ currentPassword, newPassword }));
      
      // Show success message
      this.notification.success('Jelszó sikeresen megváltoztatva');
      
      // Reset form and navigation state
      this.passwordForm.reset();
      this.form.resetForm();
      
      // Navigate back after a short delay to show the success message
      setTimeout(() => {
        this.goBack();
      }, 1000);
      
    } catch (error) {
      console.error('Error changing password:', error);
      this.notification.error('Hiba történt a jelszó módosítása közben');
    } finally {
      this.isSubmitting = false;
    }
  }

  togglePasswordVisibility(field: 'currentPassword' | 'newPassword' | 'confirmPassword') {
    if (field === 'currentPassword') {
      this.showCurrentPassword = !this.showCurrentPassword;
    } else if (field === 'newPassword') {
      this.showNewPassword = !this.showNewPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  onInput(field: string) {
    const control = this.passwordForm.get(field);
    if (control) {
      control.markAsTouched();
      control.updateValueAndValidity({ onlySelf: true });
      
      // If confirm password changes, update its validation
      if (field === 'newPassword' || field === 'confirmPassword') {
        this.passwordForm.updateValueAndValidity();
      }
    }
  }

  goBack() {
    this.location.back();
  }

  get currentPassword() { return this.passwordForm.get('currentPassword'); }
  get newPassword() { return this.passwordForm.get('newPassword'); }
  get confirmPassword() { return this.passwordForm.get('confirmPassword'); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
