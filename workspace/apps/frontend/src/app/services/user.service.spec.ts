import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from "@angular/common/http";
import { User } from '@/app/models/user.model';
import { ServerResponse } from "@/app/models/server-response";
import { UserService } from './user.service';


describe('UserService', () => {
  let service: UserService;
  let httpTesting: HttpTestingController;

  const stubUser: User = {
    id: '1',
    email: 'testuser@example.com',
  };

  const stubGetAllResponse: ServerResponse<User[]> = {
    data: [ stubUser ],
    message: 'Success',
    success: true
  };

  const stubGetResponse: ServerResponse<User> = {
    data: stubUser,
    message: 'Success',
    success: true
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get the users', (done) => {
    service.getAllUsers().subscribe(data => {
      expect(data).toEqual(stubGetAllResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/user`);
    expect(req.request.method).toBe('GET');
    req.flush(stubGetAllResponse);
  })

  it('should get one user', (done) => {
    service.getUser('1').subscribe(data => {
      expect(data).toEqual(stubGetResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/user/1`);
    expect(req.request.method).toBe('GET');
    req.flush(stubGetResponse);
  });

  it('should add a user and return the user', (done) => {
    service.addUser(stubUser).subscribe(data => {
      expect(data).toEqual(stubGetResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/user`);
    expect(req.request.method).toBe('POST');
    req.flush(stubGetResponse);
  });

  it('should update a user and return the user', (done) => {
    service.updateUser('1', stubUser).subscribe(data => {
      expect(data).toEqual(stubGetResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/user/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(stubGetResponse);
  });

  it('should delete a user and return all the users', (done) => {
    service.deleteUser('1').subscribe(data => {
      expect(data).toEqual(stubGetAllResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/user/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(stubGetAllResponse);
  });
});
