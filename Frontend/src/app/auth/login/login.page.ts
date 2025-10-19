import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonInput, IonContent, IonHeader, IonTitle, IonToolbar, IonItem, IonButton, IonLabel, IonSpinner, IonToast } from '@ionic/angular/standalone';
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
    CommonModule,
    FormsModule
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
      this.error = 'Username and password required';
      return;
    }

    this.loading = true;
    this.error = null;


    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.loading = false;

        // Timeout to ensure signals are updated
        setTimeout(() => {
          this.router.navigate(['/tabs/home']).then((result) => {
            if (!result) {
              console.error('Navigation failed!');
              this.error = 'Navigation failed after login';
            }
          }).catch((err) => {
            console.error('Navigation error:', err);
            this.error = 'Navigation error: ' + err;
          });
        }, 100);
      },
      error: (err: any) => {
        console.error('Login error:', err);
        console.log('Error status:', err.status);
        console.log('Error message:', err.error);

        this.error = err.error?.detail || 
                     err.error?.non_field_errors?.[0] || 
                     err.error?.username?.[0] ||
                     'Login failed';
        this.loading = false;
      },
    });
  }
}