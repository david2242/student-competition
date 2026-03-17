import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { ParticipantService } from './participant.service';
import { CompetitionParticipant } from '../models/participant.model';

describe('ParticipantService', () => {
  let service: ParticipantService;
  let httpMock: HttpTestingController;

  const existingParticipant: CompetitionParticipant = {
    studentId: 1,
    firstName: 'John',
    lastName: 'Doe',
    classYear: 9,
    classLetter: 'a'
  };

  const newParticipant: CompetitionParticipant = {
    firstName: 'Jane',
    lastName: 'Smith',
    classYear: 10,
    classLetter: 'b'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ParticipantService]
    });
    service = TestBed.inject(ParticipantService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('initialize', () => {
    it('should set the participant list', () => {
      service.initialize([existingParticipant]);
      service.participants$.subscribe(p => expect(p).toEqual([existingParticipant]));
    });

    it('should replace any previously set participants', () => {
      service.initialize([existingParticipant]);
      service.initialize([newParticipant]);
      service.participants$.subscribe(p => expect(p).toEqual([newParticipant]));
    });
  });

  describe('addParticipant', () => {
    it('should add a participant to the list', () => {
      service.addParticipant(existingParticipant);
      service.participants$.subscribe(p => expect(p).toHaveLength(1));
    });

    it('should not add a duplicate existing student (matched by studentId)', () => {
      service.addParticipant(existingParticipant);
      service.addParticipant({ ...existingParticipant, classYear: 10 });
      service.participants$.subscribe(p => expect(p).toHaveLength(1));
    });

    it('should not add a duplicate new participant (matched by name)', () => {
      service.addParticipant(newParticipant);
      service.addParticipant({ ...newParticipant, classYear: 11 });
      service.participants$.subscribe(p => expect(p).toHaveLength(1));
    });

    it('should add a participant with a different name', () => {
      service.addParticipant(newParticipant);
      service.addParticipant({ firstName: 'Bob', lastName: 'Jones', classYear: 9, classLetter: 'a' });
      service.participants$.subscribe(p => expect(p).toHaveLength(2));
    });
  });

  describe('removeParticipant', () => {
    beforeEach(() => service.initialize([existingParticipant, newParticipant]));

    it('should remove the participant at the given index', () => {
      service.removeParticipant(0);
      service.participants$.subscribe(p => {
        expect(p).toHaveLength(1);
        expect(p[0]).toEqual(newParticipant);
      });
    });

    it('should leave the list unchanged for an out-of-range index', () => {
      service.removeParticipant(99);
      service.participants$.subscribe(p => expect(p).toHaveLength(2));
    });
  });

  describe('clearParticipants', () => {
    it('should empty the participant list', () => {
      service.initialize([existingParticipant]);
      service.clearParticipants();
      service.participants$.subscribe(p => expect(p).toHaveLength(0));
    });
  });

  describe('getParticipantsForSubmission', () => {
    it('should map an existing student to ExistingParticipant format (no name fields)', () => {
      service.initialize([existingParticipant]);
      const [result] = service.getParticipantsForSubmission();
      expect(result).toEqual({ studentId: 1, classYear: 9, classLetter: 'a' });
      expect(result).not.toHaveProperty('firstName');
      expect(result).not.toHaveProperty('lastName');
    });

    it('should map a new participant to NewParticipant format (no studentId)', () => {
      service.initialize([newParticipant]);
      const [result] = service.getParticipantsForSubmission();
      expect(result).toEqual({ firstName: 'Jane', lastName: 'Smith', classYear: 10, classLetter: 'b' });
      expect(result).not.toHaveProperty('studentId');
    });

    it('should handle a mixed list correctly', () => {
      service.initialize([existingParticipant, newParticipant]);
      const result = service.getParticipantsForSubmission();
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('studentId');
      expect(result[1]).not.toHaveProperty('studentId');
    });
  });

  describe('searchStudents', () => {
    it('should query the search endpoint and return results', () => {
      const mockResults = [{
        id: 1, firstName: 'John', lastName: 'Doe', fullName: 'John Doe',
        currentClassYear: 9, currentClassLetter: 'a', participations: []
      }];

      service.searchStudents('John').subscribe(results => expect(results).toEqual(mockResults));

      const req = httpMock.expectOne(r => r.url.includes('/students/search'));
      expect(req.request.params.get('query')).toBe('John');
      req.flush({ data: { results: mockResults, totalCount: 1 } });
    });

    it('should return an empty array when the response data is null', () => {
      service.searchStudents('xyz').subscribe(results => expect(results).toEqual([]));
      httpMock.expectOne(r => r.url.includes('/students/search')).flush({ data: null });
    });

    it('should propagate HTTP errors to the subscriber', () => {
      let caughtError: unknown;
      service.searchStudents('fail').subscribe({ error: e => caughtError = e });

      httpMock
        .expectOne(r => r.url.includes('/students/search'))
        .flush('Server error', { status: 500, statusText: 'Internal Server Error' });

      expect(caughtError).toBeTruthy();
    });
  });
});
