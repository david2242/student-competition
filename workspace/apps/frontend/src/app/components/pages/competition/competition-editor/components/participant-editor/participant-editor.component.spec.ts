import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ParticipantEditorComponent } from './participant-editor.component';
import { ParticipantService } from '../../services/participant.service';
import { BehaviorSubject, of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { StudentSearchResult } from '../../models/participant.model';

describe('ParticipantEditorComponent', () => {
    let component: ParticipantEditorComponent;
    let fixture: ComponentFixture<ParticipantEditorComponent>;
    let participantService: any;
    const participantsSubject = new BehaviorSubject<any[]>([]);

    beforeEach(async () => {
        participantService = {
            participants$: participantsSubject.asObservable(),
            initialize: jest.fn(),
            clearParticipants: jest.fn(),
            addParticipant: jest.fn(),
            removeParticipant: jest.fn(),
            searchStudents: jest.fn().mockReturnValue(of([]))
        };

        await TestBed.configureTestingModule({
            imports: [ParticipantEditorComponent, NoopAnimationsModule],
            providers: [
                { provide: ParticipantService, useValue: participantService }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ParticipantEditorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize service with input participants', () => {
        const inputParticipants = [{ firstName: 'John', lastName: 'Doe', classYear: 9, classLetter: 'a' }];
        component.participants = inputParticipants;
        component.ngOnChanges({
            participants: {
                currentValue: inputParticipants,
                previousValue: [],
                firstChange: false,
                isFirstChange: () => false
            }
        });
        expect(participantService.initialize).toHaveBeenCalledWith(inputParticipants);
    });

    describe('Search Logic', () => {
        it('should call searchStudents when query is long enough', fakeAsync(() => {
            const mockResults: StudentSearchResult[] = [
                {
                    id: 1,
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: 'John Doe',
                    currentClassYear: 9,
                    currentClassLetter: 'a',
                    participations: []
                }
            ];
            participantService.searchStudents.mockReturnValue(of(mockResults));

            component.onSearch('John');
            tick();

            expect(participantService.searchStudents).toHaveBeenCalledWith('John');
            expect(component.searchResults).toEqual(mockResults);
            expect(component.isSearching).toBeFalsy();
        }));

        it('should NOT call searchStudents if query is too short', () => {
            component.onSearch('J');
            expect(participantService.searchStudents).not.toHaveBeenCalled();
            expect(component.searchResults).toEqual([]);
        });

        it('should add participant when selecting from search results', () => {
            const student: StudentSearchResult = {
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                fullName: 'John Doe',
                currentClassYear: 9,
                currentClassLetter: 'a',
                participations: []
            };
            component.onSelectStudent(student);
            expect(participantService.addParticipant).toHaveBeenCalledWith({
                studentId: 1,
                firstName: 'John',
                lastName: 'Doe',
                classYear: 9,
                classLetter: 'a'
            });
            expect(component.searchResults).toEqual([]);
        });
    });

    describe('Manual Addition', () => {
        it('should open add form and pre-fill name from search query', () => {
            component.onAddNew('Doe John');
            expect(component.showAddForm).toBeTruthy();
            expect(component.newParticipantData).toEqual({ firstName: 'John', lastName: 'Doe' });
        });

        it('should call addParticipant and close form on success', () => {
            const newParticipant = { firstName: 'Jane', lastName: 'Smith', classYear: 10, classLetter: 'b' };
            component.onAddParticipant(newParticipant as any);
            expect(participantService.addParticipant).toHaveBeenCalledWith(newParticipant);
            expect(component.showAddForm).toBeFalsy();
        });
    });

    describe('Removal', () => {
        it('should call removeParticipant on service', () => {
            component.onRemoveParticipant(0);
            expect(participantService.removeParticipant).toHaveBeenCalledWith(0);
        });
    });
});
