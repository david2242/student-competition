# 🧩 Angular Frontend Implementation - Validation Chunks

## 📌 Chunk 1: Project Setup and Module Structure

### 1.1 Create Angular Modules
```bash
# Run in frontend directory
ng generate module shared
ng generate module competition --route=competition --module=app.module.ts
ng generate module student --route=student --module=app.module.ts
```

### 1.2 Create Core Services
```bash
ng generate service core/services/student
ng generate service core/services/competition
ng generate service core/services/notification
```

### 1.3 Create Shared Components
```bash
ng generate component shared/components/loading-spinner --module=shared
ng generate component shared/components/error-message --module=shared
```

**Validation Points**:
- Verify modules are created in `app/`
- Check services are in `app/core/services/`
- Confirm shared components are in `app/shared/components/`

## 📌 Chunk 2: Student Search Component

### 2.1 Generate Component
```bash
ng generate component competition/components/student-search --module=competition
```

### 2.2 Implement Student Search Service
```typescript
// student.service.ts
@Injectable({ providedIn: 'root' })
export class StudentService {
  private apiUrl = '/api/students';
  
  constructor(private http: HttpClient) {}

  searchStudents(query: string, filters?: any): Observable<StudentSearchResult[]> {
    return this.http.get<StudentSearchResult[]>(`${this.apiUrl}/search`, {
      params: { query, ...filters }
    }).pipe(
      catchError(error => {
        console.error('Error searching students', error);
        return of([]);
      })
    );
  }
}
```

### 2.3 Implement Search Component
```typescript
// student-search.component.ts
@Component({
  selector: 'app-student-search',
  templateUrl: './student-search.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StudentSearchComponent implements ControlValueAccessor, OnDestroy {
  searchControl = new FormControl('');
  searchResults$: Observable<StudentSearchResult[]>;
  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {
    this.setupSearch();
  }

  private setupSearch() {
    this.searchResults$ = this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter(term => term.length > 2),
      switchMap(term => this.studentService.searchStudents(term))
    );
  }

  // ControlValueAccessor implementation...
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

**Validation Points**:
- Component is generated in the correct module
- Search service makes API calls correctly
- Debouncing and filtering work as expected
- Results are displayed in the template

## 📌 Chunk 3: Participant Management

### 3.1 Generate Components
```bash
ng generate component competition/components/participant-manager --module=competition
ng generate component competition/components/participant-list --module=competition
ng generate component competition/components/participant-form --module=competition
```

### 3.2 Implement Participant Service
```typescript
// competition.service.ts
@Injectable({ providedIn: 'root' })
export class CompetitionService {
  private apiUrl = '/api/competitions';
  
  createCompetition(competition: CompetitionCreateDto): Observable<Competition> {
    return this.http.post<Competition>(this.apiUrl, competition);
  }
  
  // Other competition-related methods...
}
```

### 3.3 Implement Participant Manager
```typescript
// participant-manager.component.ts
@Component({
  selector: 'app-participant-manager',
  templateUrl: './participant-manager.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticipantManagerComponent {
  participants: Participant[] = [];
  
  addParticipant(participant: Participant) {
    if (!this.participants.some(p => p.studentId === participant.studentId)) {
      this.participants = [...this.participants, participant];
    }
  }
  
  removeParticipant(participant: Participant) {
    this.participants = this.participants.filter(p => p !== participant);
  }
}
```

**Validation Points**:
- Components are generated correctly
- Participant addition/removal works
- No duplicate participants allowed
- State updates immutably

## 📌 Chunk 4: Competition Form

### 4.1 Generate Competition Form
```bash
ng generate component competition/components/competition-form --module=competition
```

### 4.2 Implement Form Logic
```typescript
// competition-form.component.ts
@Component({
  selector: 'app-competition-form',
  templateUrl: './competition-form.component.html'
})
export class CompetitionFormComponent implements OnInit {
  competitionForm: FormGroup;
  isLoading = false;
  
  constructor(
    private fb: FormBuilder,
    private competitionService: CompetitionService,
    private notification: NotificationService
  ) {
    this.initForm();
  }
  
  private initForm() {
    this.competitionForm = this.fb.group({
      name: ['', [Validators.required]],
      description: [''],
      startDate: [null, [Validators.required]],
      endDate: [null, [Validators.required]],
      participants: [[], [Validators.required, Validators.minLength(1)]]
    });
  }
  
  onSubmit() {
    if (this.competitionForm.invalid) return;
    
    this.isLoading = true;
    const competitionData = this.competitionForm.value;
    
    this.competitionService.createCompetition(competitionData).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.notification.showSuccess('Competition created successfully');
        // Navigate or reset form
      },
      error: (error) => {
        this.notification.showError('Failed to create competition');
        console.error('Error creating competition', error);
      }
    });
  }
}
```

**Validation Points**:
- Form validation works
- Form submission handles loading states
- Error handling is in place
- Success/error notifications appear

## 📌 Chunk 5: Integration and Testing

### 5.1 Update App Routing
```typescript
// app-routing.module.ts
const routes: Routes = [
  { 
    path: 'competitions',
    loadChildren: () => import('./competition/competition.module')
      .then(m => m.CompetitionModule) 
  },
  { path: '', redirectTo: '/competitions', pathMatch: 'full' },
  { path: '**', redirectTo: '/competitions' }
];
```

### 5.2 Add Basic E2E Test
```typescript
// competition.e2e-spec.ts
describe('Competition Creation', () => {
  beforeEach(() => {
    cy.visit('/competitions/new');
  });

  it('should create a new competition', () => {
    // Fill in form
    cy.get('[formControlName="name"]').type('Math Competition');
    // Add more test steps...
    
    // Verify success message
    cy.contains('Competition created successfully').should('be.visible');
  });
});
```

**Validation Points**:
- Navigation works correctly
- Lazy loading functions
- E2E tests pass
- All components integrate smoothly

## 🚀 Next Steps
1. Implement each chunk one by one
2. Validate each chunk before moving to the next
3. Run tests after each chunk
4. Document any issues found during validation
