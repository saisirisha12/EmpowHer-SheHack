import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { QuestionnaireComponent } from './components/questionnaire/questionnaire.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProfileComponent } from './components/profile/profile.component';
import { ConnectComponent } from './components/connect/connect.component';
import { CommunityComponent } from './components/community/community.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'questionnaire', component: QuestionnaireComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'connect', component: ConnectComponent },
  { path: 'community', component: CommunityComponent },
  { path: '**', redirectTo: 'login' }
];
