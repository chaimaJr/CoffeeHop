import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonLabel, IonSpinner, IonText // Import IonText for error messages
, IonButtons, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [ 
    IonButton,
    IonItem,
    IonInput,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSpinner,
    IonText,
    CommonModule,
    FormsModule,
]
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  loading = false;
  error: string | null = null;

  login() {
    if (!this.username || !this.password) {
      this.error = 'Username and password are required.';
      return;
    }

    this.loading = true;
    this.error = null;

    this.authService.login(this.username, this.password).subscribe({
      next: (response: any) => {
        this.loading = false;
        
        // Normalize role to lowercase for consistent checking
        const userRole = response.user?.role?.toLowerCase();

        let redirectPath: string;
        if (userRole === 'barista' || userRole === 'admin') {
          redirectPath = '/barista';
        } else if (userRole === 'customer') {
          redirectPath = '/tabs/home';
        } else {
          // This handles cases where the role is missing or unknown
          this.error = 'Login failed: Invalid user role received.';
          return;
        }

        // Navigate and prevent user from going back to the login page
        this.router.navigate([redirectPath], { replaceUrl: true });
      },
      error: (err: any) => {
        this.loading = false;
        // Provide a user-friendly error message
        this.error = err.error?.detail 
          || err.error?.non_field_errors?.[0] 
          || 'Invalid username or password.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }
}