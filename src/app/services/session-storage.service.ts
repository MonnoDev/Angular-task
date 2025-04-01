import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';

//Kadangi pries siunciant data reikia ja patvirtinti, iki patvirtinimo ja saugome session storage

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {
  private storageKey = 'InformacijaApieVeiksma';
  router = inject(Router)

  constructor() {}

  //Saugome darbuotoju data kuri irasoma inpute prisijungiant
  saveEmployeeData(employeeId: string, position: string, firstName: string, lastName: string) {
    const currentDate = new Date().toISOString();

    const employeeData = {
      employeeId,
      position,
      firstName,
      lastName,
      loginDate : currentDate,
      projects: [],
    };

    sessionStorage.setItem(this.storageKey, JSON.stringify([employeeData]));
  }

  //Pasiemame darbuotojo ID, naudojama kai reikia patvirtinti ID pries siunciant i MongoDB
  getCurrentEmployeeId(): string | null {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return data.length > 0 ? data[0].employeeId : null;
  }

  //Pasiemame darbuotojo pozicija, naudojama admin biew nustatyti
  getUserPosition(): string | null {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return data.length > 0 ? data[0].position : null;
  }

  //Pasiemame darbuotojo varda, naudojama siunciant data
  getFirstName(): string | null {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return data.length > 0 ? data[0].firstName : null;
  }

  //Pasiemame darbuotojo pavarde, naudojama siunciant data
  getLastName(): string | null {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return data.length > 0 ? data[0].lastName : null;
  }

  //Pasiemame darbuotojo prisijungimo data, naudojama siunciant data
  getLoginDate(): string | null {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    return data.length > 0 ? data[0].loginDate : null;
  }

  //Pasiemame produkto kieki, kad darbuotojas negaletu prideti daugiau vienetu nei siuo metu turima
  getInventoryCount(productId: string): number {
    const data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    const employee = data.length > 0 ? data[0] : null;

    if (!employee) return 0;

    let count = 0;
    employee.projects.forEach((project: any) => {
    count += project.inventory.filter((id: string) => id === productId).length;
  });
    return count;
  }

  //Pridedame proektus
  addInventoryToProject(employeeId: string, projectId: string, inventoryId: string) {
    let data = JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
    let employee = data.find((emp: any) => emp.employeeId === employeeId);
  
    if (!employee) {
      this.router.navigate(['/']);
    }
    let project = employee.projects.find((proj: any) => proj.projectId === projectId);
    if (!project) {
      project = { projectId, inventory: [] };
      employee.projects.push(project);
    }
    if (!Array.isArray(project.inventory)) {
      project.inventory = [];
    }
    project.inventory.push(inventoryId);
    sessionStorage.setItem(this.storageKey, JSON.stringify(data));
  }
  
  //Istriname session storage data
  clear() {
    sessionStorage.clear();
  }

  //Pasiemame visa session storage data
  getSessionData() {
    return JSON.parse(sessionStorage.getItem(this.storageKey) || '[]');
  }
}
