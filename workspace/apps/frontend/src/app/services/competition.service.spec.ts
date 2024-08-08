import {firstValueFrom} from "rxjs";
import { TestBed } from '@angular/core/testing';
import {provideHttpClient} from "@angular/common/http";
import {HttpTestingController, provideHttpClientTesting} from "@angular/common/http/testing";
import {Competition, ServerResponse} from "@/models/competition.model";
import {CompetitionService} from './competition.service';

describe('CompetitionService', () => {

  const stubCompetition: Competition = {
    id: 1,
    name: 'Test Competition',
    location: 'Test Location',
    subject: [],
    teacher: [],
    year: '',
    date: new Date(),
    level: 'local',
    round: 'state',
    form: ["oral"],
    result: {
      position: 0,
      specialPrize: false,
      compliment: false,
      nextRound: false
    },
    note: ''
  }

  const stubGetAllResponse: ServerResponse<Competition[]> = {
    data: [stubCompetition],
    message: 'Success',
    success: true
  }

  let service: CompetitionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CompetitionService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CompetitionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get competitions', () => {
    service.getCompetitions().subscribe();
    const req = httpTesting.expectOne('http://localhost:5157/competition');
    expect(req.request.method).toBe('GET');
  });

  it('should get stubCompetitions', async () => {
    const getAll = service.getCompetition(1);
    const getAllPromise = firstValueFrom(getAll);
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    req.flush(stubGetAllResponse);
    expect(await getAllPromise).toEqual(stubGetAllResponse);
  });

  it('should get competition', () => {
    service.getCompetition(1).subscribe();
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    expect(req.request.method).toBe('GET');
  });

  it('should get the stubCompetition', () => {
    service.getCompetition(1).subscribe((data) => {
      expect(data).toEqual(stubCompetition);
    });
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    req.flush(stubCompetition);
  })

  it('should create competition', () => {
    service.createCompetition(stubCompetition).subscribe();
    const req = httpTesting.expectOne('http://localhost:5157/competition');
    expect(req.request.method).toBe('POST');
  });

  it('should update competition', () => {
    service.updateCompetition(1, stubCompetition).subscribe();
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    expect(req.request.method).toBe('PUT');
  });

  it('should update the competition', () => {
    service.updateCompetition(1, stubCompetition).subscribe((data) => {
      expect(data).toEqual(stubCompetition);
    });
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    req.flush(stubCompetition);
  });

  it('should delete competition', () => {
    service.deleteCompetition(1).subscribe();
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    expect(req.request.method).toBe('DELETE');
  });

  it('should delete the competition', () => {
    service.deleteCompetition(1).subscribe((data) => {
      expect(data).toEqual(stubCompetition);
    });
    const req = httpTesting.expectOne('http://localhost:5157/competition/1');
    req.flush(stubCompetition);
  });
});
