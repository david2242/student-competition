import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '@/app/services/auth.service';
import { NotificationService } from '@/app/services/notification.service';
import { firstValueFrom, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styles: [`
    .card {
      max-width: 600px;
      margin: 0 auto;
    }
  `]
})
export class ProfileComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  profileForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService,
    private location: Location
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    this.authService.$currentUser.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      if (user) {
        this.profileForm.patchValue({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || ''
        });
      }
    });
  }

  async onSubmit() {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    try {
      await firstValueFrom(this.authService.updateProfile(this.profileForm.value));
      this.notification.success('Profil sikeresen frissítve');
    } catch (error) {
      console.error('Error updating profile:', error);
      this.notification.error('Hiba történt a profil frissítése közben');
    } finally {
      this.isSubmitting = false;
    }
  }

  goBack() {
    this.location.back();
  }

  get firstName() { return this.profileForm.get('firstName'); }
  get lastName() { return this.profileForm.get('lastName'); }
  get email() { return this.profileForm.get('email'); }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
