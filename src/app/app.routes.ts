import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => {
      return import('./pages/login/login.component').then((m) => m.LoginComponent);
    },
  },
  {
    path: 'home',
    loadComponent: () => {
      return import('./pages/home/home.component').then((m) => m.HomeComponent);
    },
  },
  {
    path: 'projects/:id', 
    loadComponent: () =>{
        return import('./pages/projects/projects.component').then((m) => m.ProjectsComponent);
    },
  },
  {
    path: 'admin', 
    loadComponent: () =>{
        return import('./pages/admin/admin.component').then((m) => m.AdminComponent);
    },
  },
  
];

// Cia sudeti visi route kurie yra sioje aplikacijoje