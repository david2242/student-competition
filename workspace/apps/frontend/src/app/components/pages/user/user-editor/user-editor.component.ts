import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { UserService } from '@/app/services/user.service';
import { Role } from '@/app/models/current-user';
import { NotificationService } from '@/app/services/notification.service';
import { firstValueFrom } from 'rxjs';
import { RoleTranslatorService } from '@/app/services/role-translator.service';

export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) {
      return null;
    }

    const hasUpperCase = /[A-Z]/.test(control.value);
    const hasLowerCase = /[a-z]/.test(control.value);
    const hasNumeric = /[0-9]/.test(control.value);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(control.value);
    const isLengthValid = control.value.length >= 8;

    const errors: ValidationErrors = {};

    if (!hasUpperCase) errors['uppercase'] = true;
    if (!hasLowerCase) errors['lowercase'] = true;
    if (!hasNumeric) errors['numeric'] = true;
    if (!hasSpecialChar) errors['specialChar'] = true;
    if (!isLengthValid) errors['minlength'] = { requiredLength: 8 };

    return Object.keys(errors).length > 0 ? errors : null;
  };
}

@Component({
  selector: 'app-user-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './user-editor.component.html',
  styles: [`
    .card {
      max-width: 800px;
      margin: 0 auto;
    }
  `]
})
export class UserEditorComponent implements OnInit {
  form: FormGroup;
  isEditMode = false;
  isSubmitting = false;
  userId: string | null = null;
  roles = Object.values(Role);
  private roleTranslator = inject(RoleTranslatorService);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private notification: NotificationService
  ) {
    this.form = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      role: [Role.VIEWER, Validators.required],
      password: [''],
      confirmPassword: ['']
    });
  }

  async ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.userId;

    if (this.isEditMode) {
      this.form.get('password')?.clearValidators();
      this.form.get('confirmPassword')?.clearValidators();

      await this.loadUser();
    } else {
      this.form.get('password')?.setValidators([Validators.required, passwordValidator()]);
      this.form.get('confirmPassword')?.setValidators([Validators.required]);
    }

    const passwordMatchValidatorFn: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
      if (control instanceof FormGroup) {
        return this.passwordMatchValidator(control);
      }
      return null;
    };
    this.form.setValidators([passwordMatchValidatorFn]);

    this.form.statusChanges.subscribe(status => {
      Object.keys(this.form.controls).forEach(key => {
        const control = this.form.get(key);
        if (control?.errors) {
          console.log(`Control ${key} errors:`, control.errors);
        }
      });
    });

    this.form.updateValueAndValidity();
  }

  private async loadUser() {
    if (!this.userId) return;

    try {
      const user = await firstValueFrom(this.userService.getUser(this.userId));
      this.form.patchValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role
      });
    } catch (error) {
      this.notification.error('Nem sikerült betölteni a felhasználót');
      console.error('Error loading user:', error);
      this.router.navigate(['../'], { relativeTo: this.route });
    }
  }

  async onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const userData = { ...this.form.value };

    try {
      if (this.isEditMode && this.userId) {
        // Don't update password if not changed
        if (!userData.password) {
          delete userData.password;
        }
        await firstValueFrom(this.userService.updateUser(this.userId, userData));
        this.notification.success('Felhasználó sikeresen frissítve');
      } else {
        await firstValueFrom(this.userService.addUser(userData));
        this.notification.success('Felhasználó sikeresen létrehozva');
      }
      this.router.navigate(['/admin/users']);
    } catch (error) {
      const errorMessage = this.isEditMode ? 'updating' : 'creating';
      this.notification.error(`Hiba történt a felhasználó ${errorMessage === 'updating' ? 'frissítése' : 'létrehozása'} közben`);
      console.error(`Error ${errorMessage} user:`, error);
    } finally {
      this.isSubmitting = false;
    }
  }

  onCancel() {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getTranslatedRole(role: Role): string {
    return this.roleTranslator.translate(role);
  }

  private passwordMatchValidator(g: FormGroup): ValidationErrors | null {
    const password = g.get('password');
    const confirmPassword = g.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    if (this.isEditMode && !password.value && !confirmPassword.value) {
      return null;
    }

    if (this.isEditMode && (!password.value || !confirmPassword.value)) {
      return { passwordChangeInProgress: true };
    }

    if (password.value !== confirmPassword.value) {
      return { mismatch: true };
    }

    return null;
  }
}
