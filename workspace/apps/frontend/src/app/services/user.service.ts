import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@/environments/environment';
import {User} from '@/app/models/user.model';
import {ServerResponse} from '@/app/models/server-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl = `${environment.apiUrl}/api`;
  httpService = inject(HttpClient);

  getAllUsers() {
    return this.httpService.get<ServerResponse<User[]>>(`${this.apiUrl}/user`);
  }

  getUser(id: string) {
    return this.httpService.get<ServerResponse<User>>(`${this.apiUrl}/user/${id}`);
  }

  addUser(user: User) {
    return this.httpService.post<ServerResponse<User>>(`${this.apiUrl}/user`, user);
  }

  updateUser(id: string, user: User) {
    return this.httpService.put<ServerResponse<User>>(`${this.apiUrl}/user/${id}`, user);
  }

  deleteUser(id: string) {
    return this.httpService.delete<ServerResponse<User>>(`${this.apiUrl}/user/${id}`);
  }
}
