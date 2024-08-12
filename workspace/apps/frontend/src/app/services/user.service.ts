import {Injectable, inject} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '@/environments/environment';
import {User} from '@/app/models/user.model';
import {ServerResponse} from '@/app/models/server-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  apiUrl = environment.apiUrl;
  httpService = inject(HttpClient);

  getAllUsers() {
    return this.httpService.get<ServerResponse<User[]>>(`${this.apiUrl}/api/user`);
  }

  getUser(id: string) {
    return this.httpService.get<ServerResponse<User>>(`${this.apiUrl}/api/user/${id}`);
  }

  addUser(user: User) {
    return this.httpService.post<ServerResponse<User>>(`${this.apiUrl}/api/user`, user);
  }

  updateUser(id: string, user: User) {
    return this.httpService.put<ServerResponse<User>>(`${this.apiUrl}/api/user/${id}`, user);
  }

  deleteUser(id: string) {
    return this.httpService.delete<ServerResponse<User>>(`${this.apiUrl}/api/user/${id}`);
  }
}
