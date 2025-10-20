import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonRouterLink,
  IonButtons,
  IonBackButton,
  IonSpinner,
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

/**
 * Custom validator to check if password and password_confirm match
 */
export function passwordMatchValidator(
  control: AbstractControl
): ValidationErrors | null {
  const password = control.get('password');
  const passwordConfirm = control.get('password_confirm');

  // Manually set/clear error on the confirm control
  if (password?.value !== passwordConfirm?.value) {
    passwordConfirm?.setErrors({ mismatch: true });
    return { mismatch: true };
  } else if (passwordConfirm?.hasError('mismatch')) {
    // Manually clear the mismatch error if they now match
    const errors = passwordConfirm.errors;
    if (errors) {
      delete errors['mismatch'];
      if (Object.keys(errors).length === 0) {
        passwordConfirm.setErrors(null);
      } else {
        passwordConfirm.setErrors(errors);
      }
    }
  }
  return null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonButton,
    IonToast,
    IonRouterLink,
    IonButtons,
    IonBackButton,
    IonSpinner,
  ],
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor() {
    this.form = this.fb.group(
      {
        first_name: ['', [Validators.required]],
        last_name: ['', [Validators.required]],
        phone: ['', [Validators.required]],
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        password_confirm: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator }
    );
  }

  // Helper getter
  get passwordConfirm() {
    return this.form.get('password_confirm');
  }

  onRegister(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched(); // Show errors on all fields
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.error = err.error;
        this.loading = false;
      },
    });
  }
}
