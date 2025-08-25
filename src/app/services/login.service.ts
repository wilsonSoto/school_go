import { hostUrlEnum, userDataEnum } from '../../types'
import { map } from 'rxjs/operators';

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authState = new BehaviorSubject<boolean>(false);
  private TOKEN_KEY = 'auth-token';
  private apiUrl = 'https://tu-backend.com/api'; // ⚡ Cambia por tu API
  appURl = hostUrlEnum.is_production ? hostUrlEnum.prod : hostUrlEnum.develop

  constructor(private httpClient: HttpClient, private storage: Storage) {
    this.initStorage();
  }

  private async initStorage() {
    await this.storage.create();
    this.checkToken();
  }

  /** Verifica si hay token guardado */
  private async checkToken() {
    const token = await this.storage.get(this.TOKEN_KEY);
    this.authState.next(!!token);
  }

  /** Saber si el usuario está logueado */
  isLoggedIn(): boolean {
    return this.authState.value;
  }

  /** Observable para escuchar cambios de sesión */
  authState$() {
    return this.authState.asObservable();
  }

  /** Hacer login contra el backend y guardar token */
   login(dataLogin: any) {
    // const res: any = await this.httpClient.post(`${this.apiUrl}/login`, { email, password }).toPromise();
    
    
    const params = {
      "params": dataLogin
    }
    const url = this.appURl +'/authenticate';
    return this.httpClient.post(url, params).pipe(
      map(async(res: any) => {
        if (res?.result.token) {
          await this.storage.set(this.TOKEN_KEY, res.result.token);
          // await this.storage.set(userDataEnum, res.result);
          localStorage.setItem(userDataEnum,JSON.stringify(res.result))
          this.authState.next(true);
        }
        return res.result;
        return res;
      })
    );
  }

  /** Cerrar sesión */
  async logout() {
    await this.storage.remove(this.TOKEN_KEY);
    localStorage.removeItem(userDataEnum)
    this.authState.next(false);
  }

  /** Obtener token para los interceptores */
  async getToken(): Promise<string | null> {
    return await this.storage.get(this.TOKEN_KEY);
  }
}
