import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { SessionStorageService } from '../../services/session-storage.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  httpClient = inject(HttpClient);
  sessionService = inject(SessionStorageService);
  route = inject(ActivatedRoute);
  router = inject(Router); 
  products: any[] = [];
  projects: any[] = [];
  errorMessage: string = '';
  projectId: string | null = null;
  employeeId: string | null = null;
  firstName: string | null = null; 
  lastName: string | null = null;
  loginDate: string | null = null;
  position: string | null = null;
  inventory: string[] = [];
  showConfirmation: boolean = false;
  enteredEmployeeId: string = '';
  showDeclineButton: boolean = false;
  declineButtonTimer: any;
  countdown: number = 15;
  inventoryStock: number = 0;

  constructor() {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id');
    });
    this.employeeId = this.sessionService.getCurrentEmployeeId();
    this.position = this.sessionService.getUserPosition();
    this.firstName = this.sessionService.getFirstName();
    this.lastName = this.sessionService.getLastName();
    this.loginDate = this.sessionService.getLoginDate();
    this.fetchProducts();
  }
  
  //Pasiemame invetoriaus data validacijoms
  fetchProducts() {
    this.httpClient.get<any[]>('http://localhost:2000/inventory').subscribe((response) => {
      this.products = response;
    });
  }

  //Pridedame produktus prie proekto
  addProductToProject(input: HTMLInputElement) {
    if (!this.projectId) {
      this.errorMessage = 'Proektas nerastas';
      return;
    }

    const enteredProduct = input.value;
    if (!enteredProduct) {
      this.errorMessage = 'Neteisingas produkto ID';
      return;
    }

    const productStock = this.products.find(prod => prod.code === enteredProduct);
    const storedCount = this.sessionService.getInventoryCount(enteredProduct);

    if (productStock.stock <= 0) {  
      alert('Šio produkto kiekis yra 0');
      return;
    }

    if (storedCount + 1 > productStock.stock) {
      alert(`Šio produkto kiekis viršytas! Pridėtų produktų kiekis: ${storedCount}`);
      return;
    }
    const foundProduct = this.products.find(prod => prod.code === enteredProduct);

    if (foundProduct) {
      if (this.employeeId) {
        this.inventory.push(enteredProduct);
        this.sessionService.addInventoryToProject(this.employeeId, this.projectId, enteredProduct);
      } else {
        console.error('Darbuotojo ID nerastas');
      }
      this.errorMessage = '';
      input.value = '';
      this.startDeclineButtonTimer();
    } else {
      this.errorMessage = 'Neteisingas produkto ID';
    }
  }

  //Mygtukas su timer funkcija
  startDeclineButtonTimer() {
    if (this.declineButtonTimer) {
      clearInterval(this.declineButtonTimer);
    }
    this.showDeclineButton = true;
    this.countdown = 15;
    this.declineButtonTimer = setInterval(() => {
      this.countdown--;
      if (this.countdown === 0) {
        clearInterval(this.declineButtonTimer);
        this.showDeclineButton = false;
      }
    }, 1000);
  }

  //Atmesti isdavima
  declineIssuance() {
    this.showDeclineButton = false;
    clearInterval(this.declineButtonTimer);
    this.sessionService.clear()
    this.router.navigate(['/']);
  }

  //Patvirtiname isdavima
  confirmIssuance() {
    this.showConfirmation = true;
  }

  //Siunciame visa surinkta informacija is session storage i Mongo DB
  sendDataToDB() {
    if (!this.employeeId || !this.firstName || !this.lastName || !this.loginDate || !this.position || !this.projectId || this.inventory.length === 0) {
      this.errorMessage = 'Trūksta duomenų, kreipkitės į vadovą';
      return;
    }

    if (this.enteredEmployeeId !== this.employeeId) {
      alert('Neteisingas darbuotojo ID! Patikrinkite įvestą ID.');
      this.sessionService.clear();
      this.router.navigate(['/']);
      return;
    }

    const requestData = {
      employeeId: this.employeeId,
      firstName: this.firstName,
      lastName: this.lastName,
      loginDate: this.loginDate,
      position: this.position,
      projects: [
        {
          inventory: this.inventory,
          projectId: this.projectId,
        }
      ]
    };

    this.httpClient.post('http://localhost:2000/employees', requestData)
    .subscribe({
      next: () => {
        this.sessionService.clear();
        this.router.navigate(['/']);
      },
      error: () => {
        this.errorMessage = 'Serverio problema, kreipkitės į vadovą'
      },
      complete: () => {
        console.log('Informacija išsiūsta');
      }
    });
  
  }
}
