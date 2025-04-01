import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionStorageService } from '../../services/session-storage.service';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent {
  httpClient = inject(HttpClient);
  employees: any[] = [];
  sessionService = inject(SessionStorageService);
  router = inject(Router);

  constructor() {
    this.checkEmployee();
    this.fetchEmployeeProjects();
  }

  //Pasiemame darbuotoju data is Mongo DB
  fetchEmployeeProjects() {
    this.httpClient.get<any[]>('http://localhost:2000/employees').subscribe((response) => {
      this.employees = response;
    });
  }

  //Jei darbuotojas neprisijunges ar ne aprover pozicijoje neleidziame ziureti admin page
  checkEmployee() {
    const employeePosition = this.sessionService.getUserPosition();
    const employeeData = this.sessionService.getSessionData();
    if (!employeeData || employeeData.length === 0 || employeePosition !== 'Aprover') {
      this.router.navigate(['/']);
    }
  }

  //Filtruojame pagal varda 
  sortByName() {
  this.employees = [...this.employees].sort((a, b) => {
    const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
    const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
  }

  //Filtruojame pagal data
  sortByDate() {
  this.employees = [...this.employees].sort((a, b) => {
    const dateA = new Date(a.loginDate);
    const dateB = new Date(b.loginDate);
    return dateA.getTime() - dateB.getTime();
  });
  }

  //Filtruojame pagal darbuotojo ID
  sortByEmployeeId() {
  this.employees = [...this.employees].sort((a, b) => a.employeeId.localeCompare(b.employeeId));
  }

  //Filtruojame pagal partijos numeri
  sortByInventory() {
  this.employees = this.employees.map(employee => {
    const sortedProjects = employee.projects.map((project: any) => {
      const sortedInventory = [...project.inventory].sort((a: any, b: any) => Number(a) - Number(b));
      return { ...project, inventory: sortedInventory };
    });

    return { ...employee, projects: sortedProjects };
  });
  }

  //Funkcija, kurioje perkeliamne data i PDF
  exportToPDF() {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Darbuotoju proektu ataskaita', 20, 20);

    let yPosition = 30;

    this.employees.forEach((employee) => {
      doc.setFontSize(12);
      doc.text(`Darbuotojas: ${employee.firstName} ${employee.lastName}`, 20, yPosition);
      doc.text(`Darbuotojo ID: ${employee.employeeId}`, 20, yPosition + 10);
      doc.text(`Prisijungimo atlikti proekta data: ${employee.loginDate}`, 20, yPosition + 20);

      yPosition += 30;

      if (employee.projects?.length > 0) {
        doc.text('Proektas:', 20, yPosition);
        yPosition += 10;

        employee.projects.forEach((project: any) => {
          doc.text(`Proekto ID: ${project.projectId}`, 20, yPosition);
          yPosition += 10;

          project.inventory.forEach((item: any) => {
            doc.text(`Partijos numeris: ${item}`, 40, yPosition);
            yPosition += 10;
          });

          yPosition += 10;
        });
      } else {
        doc.text('Nera jokiu proektu', 20, yPosition);
        yPosition += 10;
      }

      yPosition += 20;
    });

    doc.save('darbuotoju_proektu_ataskaita.pdf');
  }
}
