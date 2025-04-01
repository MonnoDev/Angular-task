import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  httpClient = inject(HttpClient);
  router = inject(Router);
  sessionService = inject(SessionStorageService);

  employees: any[] = [];
  errorMessage: string = '';
  inputData: string = '';

  constructor() {
    this.fetchEmployees();
  }

  //Pasiemame darbuotojus
  fetchEmployees() {
    this.httpClient.get<any[]>('http://localhost:2000/users').subscribe((data) => {
      this.employees = data;
    });
  }

  //Patikriname ar darbuotojas egzistuoja, tuomet leidziame jam jungtis
  checkEmployee(input: HTMLInputElement) {
    const enteredId = input.value;
    const foundEmployee = this.employees.find(emp => emp.employeeNumber === enteredId);

    if (foundEmployee) {
      this.sessionService.saveEmployeeData(foundEmployee.employeeNumber, foundEmployee.position, foundEmployee.firstName, foundEmployee.lastName);
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'Darbuotojo kortelė nerasta.';
    }
  }
}
