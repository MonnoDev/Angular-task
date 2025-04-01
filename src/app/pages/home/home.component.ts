import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  httpClient = inject(HttpClient);
  router = inject(Router);
  sessionService = inject(SessionStorageService);
  projects: any = [];
  isApprover: boolean = false;
  position: string | null = '';

  constructor() {
    this.fetchProjects();
    this.checkUserRole();
  }

  //Pasiemame proektus is api
  fetchProjects() {
    this.httpClient.get<any>('http://localhost:2000/projects').subscribe((response) => {
      this.projects = response.data;
    });
  }

  //Patikriname ar darbuotojo pozicija aprover
  checkUserRole() {
    const employeeData = this.sessionService.getSessionData();
    if (employeeData.length > 0) {
      this.position = employeeData[0].position;
      this.isApprover = this.position === 'Aprover';
    }
  }

  //Peradresuojame i zurnala
  linkToAdminView() {
    this.router.navigate(['/admin']);
  }

  //Readaguoti proekta
  editProject(projectId: string) {
    this.router.navigate(['/projects/', projectId]);
  }

  //Panaikinti proekta
  deleteProject(projectId: string) {
    if (confirm('Ar tikrai norite ištrintį šį proektą?')) {
      this.httpClient.delete(`http://localhost:2000/projects/${projectId}`).subscribe({
        next: () => {
          alert('Proektas ištrintas sėkmingai');
          this.fetchProjects();
        },
        error: (error) => {
          alert('Neimanoma ištrinti proekto, susisiekite su vadovu');
        }
      });
    }
  }
}
