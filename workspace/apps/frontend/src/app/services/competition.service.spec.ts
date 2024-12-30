import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { Competition, Form, Level, Round } from "@/app/models/competition.model";
import { ServerResponse } from "@/app/models/server-response";
import { CompetitionService } from './competition.service';

describe('CompetitionService', () => {

  const stubCompetition: Competition = {
    id: 1,
    name: 'Test Competition',
    location: 'Test Location',
    subject: [],
    teacher: [],
    year: '',
    level: Level.Local,
    round: Round.State,
    form: [ Form.Oral ],
    result: {
      position: 0,
      specialPrize: false,
      compliment: false,
      nextRound: false
    },
    other: ''
  }

  const stubGetAllResponse: ServerResponse<Competition[]> = {
    data: [ stubCompetition ],
    message: 'Success',
    success: true
  }

  const stubGetResponse: ServerResponse<Competition> = {
    data: stubCompetition,
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

  it('should get competitions', (done) => {
    service.getCompetitions().subscribe(data => {
      expect(data).toEqual(stubGetAllResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/competition`);
    req.flush(stubGetAllResponse);
    expect(req.request.method).toBe('GET');
  });

  it('should get competition', (done) => {
    service.getCompetition(1).subscribe(data => {
        expect(data).toEqual(stubGetResponse.data);
        done();
      }
    );
    const req = httpTesting.expectOne(`${service.apiUrl}/competition/1`);
    req.flush(stubGetResponse);
    expect(req.request.method).toBe('GET');
  });

  it('should create the competition', (done) => {
    service.createCompetition(stubCompetition).subscribe((data) => {
      expect(data).toEqual(stubGetResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/competition`);
    expect(req.request.method).toBe('POST');
    req.flush(stubGetResponse);
  });

  it('should update the competition', (done) => {
    service.updateCompetition(1, stubCompetition).subscribe((data) => {
      expect(data).toEqual(stubGetResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/competition/1`);
    req.flush(stubGetResponse);
    expect(req.request.method).toBe('PUT');
  });

  it('should delete the competition', (done) => {
    service.deleteCompetition(1).subscribe((data) => {
      expect(data).toEqual(stubGetAllResponse.data);
      done();
    });
    const req = httpTesting.expectOne(`${service.apiUrl}/competition/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(stubGetAllResponse);
  });
});
