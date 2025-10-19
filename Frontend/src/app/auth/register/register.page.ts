import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonInput, IonButton, IonToast, IonRouterLink, IonButtons, IonBackButton, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { AuthService } from 'src/app/services/auth.service';

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
    this.form = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  onRegister(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    this.authService.register(this.form.value).subscribe({
      next: () => {
        this.router.navigate(['/tabs/home']);
      },
      error: (err) => {
        this.error = err.error?.detail || 'Registration failed';
        this.loading = false;
      },
    });
  }
}
