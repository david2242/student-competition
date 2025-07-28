# Competition Editor Refactoring Plan

## Current Issues

1. **Monolithic Component**: The component handles too many responsibilities (form management, participant editing, validation, etc.)
2. **Complex Template**: The HTML template is large and contains complex conditional logic
3. **Tight Coupling**: Business logic is mixed with presentation logic
4. **Limited Reusability**: Components and services are not easily reusable
5. **State Management**: State management could be more structured

## Proposed Architecture

```
competition-editor/
├── components/
│   ├── competition-form/
│   │   ├── competition-form.component.ts
│   │   ├── competition-form.component.html
│   │   └── competition-form.component.spec.ts
│   ├── participant-editor/
│   │   ├── components/
│   │   │   ├── participant-search/
│   │   │   │   ├── participant-search.component.ts
│   │   │   │   └── participant-search.component.html
│   │   │   └── participant-form/
│   │   │       ├── participant-form.component.ts
│   │   │       └── participant-form.component.html
│   │   ├── participant-editor.component.ts
│   │   ├── participant-editor.component.html
│   │   └── participant-editor.component.spec.ts
│   └── result-editor/
│       ├── result-editor.component.ts
│       ├── result-editor.component.html
│       └── result-editor.component.spec.ts
├── models/
│   ├── competition-form.model.ts
│   └── participant.model.ts
├── services/
│   ├── competition-form.service.ts
│   ├── participant.service.ts
│   └── student-search.service.ts
├── competition-editor.component.ts
├── competition-editor.component.html
└── competition-editor.component.spec.ts
```

## Component Breakdown

### 1. Competition Editor (Container Component)
- **Responsibility**: Main container that orchestrates child components
- **Features**:
  - Handles loading/saving state
  - Manages overall form submission
  - Coordinates between child components
  - Handles navigation

### 2. Competition Form Component
- **Responsibility**: Handles basic competition details
- **Features**:
  - Form controls for name, location, date
  - Subject management (add/remove)
  - Teacher management (add/remove)
  - Level and round selection

### 3. Participant Editor Component (Modal)
- **Responsibility**: Manages competition participants
- **Features**:
  - Search and add participants
  - Remove participants
  - Display current participants
  - Handle participant-specific data

#### 3.1 Participant Search Component
- **Responsibility**: Search for existing participants
- **Features**:
  - Search input with debounce
  - Display search results with participant history
  - Handle selection of existing participant
  - Option to add new participant if no match found

#### 3.2 Participant Form Component
- **Responsibility**: Edit participant details
- **Features**:
  - Form for editing participant information
  - Class year and letter selection
  - Validation
  - Save/cancel actions

### 4. Result Editor Component
- **Responsibility**: Handles competition results
- **Features**:
  - Position input
  - Special prize/compliment toggles
  - Next round qualification

## Participant Management Flow

### 1. Adding a Participant
1. User clicks "Add Participant"
2. Search interface appears
3. User types name to search

### 2. If Match Found:
1. Display matching participants with their history
   ```
   Search Results for "John Doe":
   
   [✓] John Doe (11.c - 2023)
       Previous participations:
       - Math Competition (2022) - 10.c
       - Physics Olympiad (2021) - 9.c
   
   [✓] John Doe (5.b - 2023)
       Previous participations:
       - Math Competition (2021) - 4.b
   ```
2. User selects a participant
3. Pre-fill form with latest class info
4. Allow editing class year/letter (creates new participant)
5. On save, add as new `ExistingParticipant` with original studentId

### 3. If No Match Found:
1. Show "No results found"
2. Provide option to "Add New Participant"
3. Show form with:
   - First Name (required)
   - Last Name (required)
   - Class Year (required, dropdown)
   - Class Letter (required, dropdown)
4. On save, add as `NewParticipant`

### 4. Editing Participants in Existing Competition
1. **Existing Participants**:
   - Displayed with a delete option
   - Cannot be edited directly
   - Deletion removes them from the competition but keeps them in the database
   
2. **Modifying a Participant**:
   - User must delete the existing participant
   - Add a new participant with corrected information
   - This creates a new database record
   - The old participant remains in the database as an orphan

3. **Adding New Participants**:
   - Follows the same flow as adding to a new competition
   - Can add both existing students (from search) or new ones

### 5. Participant List
- Show all participants in the competition
- For each participant, display:
  - Name
  - Class info (year and letter)
  - Type (Existing/New) - determined by presence of studentId
  - Delete button (with confirmation for existing participants)
- Visual distinction between existing and new participants
- Warning when removing participants with competition history

## Data Models

### Participant Types
```typescript
// Participant in the context of a competition
interface CompetitionParticipant {
  studentId?: number;   // Defined for existing students, undefined for new participants
  firstName: string;    // Required for new participants
  lastName: string;     // Required for new participants
  classYear: number;
  classLetter: string;
}

// Type guard to check if a participant is an existing student
function isExistingStudent(participant: CompetitionParticipant): participant is CompetitionParticipant & { studentId: number } {
  return participant.studentId !== undefined;
}

// Search result for existing students
interface StudentSearchResult {
  studentId: number;
  firstName: string;
  lastName: string;
  fullName: string;
  participations: StudentParticipation[];
  currentClassYear: number;
  currentClassLetter: string;
}

interface StudentParticipation {
  competitionId: number;
  competitionName: string;
  competitionDate: string;
  classYear: number;
  classLetter: string;
  schoolYear: number;
  createdAt: string;
}
```

## State Management

### Participant Service
```typescript
@Injectable({ providedIn: 'root' })
export class ParticipantService {
  private participants = new BehaviorSubject<CompetitionParticipant[]>([]);
  participants$ = this.participants.asObservable();
  
  // Initialize with existing competition participants
  initialize(participants: CompetitionParticipant[]): void {
    this.participants.next([...participants]);
  }
  
  // Add participant (existing or new)
  addParticipant(participant: CompetitionParticipant): void {
    const current = this.participants.value;
    this.participants.next([...current, { ...participant }]);
  }
  
  // Remove participant by index (since we don't have participant IDs)
  removeParticipant(index: number): void {
    const current = this.participants.value;
    const updated = [...current];
    updated.splice(index, 1);
    this.participants.next(updated);
  }
  
  // Clear all participants
  clearParticipants(): void {
    this.participants.next([]);
  }
  
  // Get participants ready for API submission
  getParticipantsForSubmission() {
    return this.participants.value.map(p => {
      if (p.studentId) {
        // Existing participant
        return {
          studentId: p.studentId,
          classYear: p.classYear,
          classLetter: p.classLetter
        };
      } else {
        // New participant
        return {
          firstName: p.firstName,
          lastName: p.lastName,
          classYear: p.classYear,
          classLetter: p.classLetter
        };
      }
    });
  }
}
```

## API Integration

### Update Competition Payload
```typescript
interface UpdateCompetitionPayload {
  // ... other competition fields
  participants: Array<{
    studentId?: number;    // For existing students
    firstName?: string;    // For new students
    lastName?: string;     // For new students
    classYear: number;
    classLetter: string;
  }>;
}
```

## Implementation Considerations

1. **Competition Update Flow**:
   - When loading an existing competition, initialize the participant service with current participants
   - Track which participants are being added/removed
   - On submission, send the complete list of participants (existing and new)
   - The backend will handle creating new participant records and updating the competition's participant list

2. **User Experience**:
   - Show clear distinction between existing and new participants
   - Provide clear warnings when actions will create orphaned records
   - Consider adding a participant history view to help users understand the implications of their changes

3. **Performance**:
   - Consider implementing virtual scrolling for competitions with many participants
   - Optimize participant search with debouncing and caching

4. **Error Handling**:
   - Handle cases where a participant can't be deleted (e.g., due to dependencies)
   - Provide clear error messages for validation failures

## Future Improvements

1. **Participant Management**:
   - Add ability to merge duplicate participants
   - Implement participant history view
   - Add bulk operations for participant management

2. **Data Cleanup**:
   - Add admin tools to clean up orphaned participants
   - Implement duplicate detection

3. **User Experience**:
   - Add participant preview with full history
   - Implement undo/redo for participant changes
   - Add participant validation warnings

4. **Performance**:
   - Implement pagination for large participant lists
   - Add server-side search for participants
   - Optimize participant loading for large competitions

## Benefits

1. **Better User Experience**: Clear flow for adding both new and existing participants
2. **Data Integrity**: Ensures consistent participant data
3. **Improved Maintainability**: Separated concerns and smaller components
4. **Enhanced Reusability**: Components can be used in other parts of the application
5. **Easier Testing**: Isolated components with clear responsibilities

## Implementation Steps

1. **Setup New Structure**
   - Create new component directories and files
   - Set up module/standalone components
   - Configure routing if needed

2. **Implement Participant Management**
   - Create participant search component
   - Implement search with debounce
   - Create participant form component
   - Handle both new and existing participant flows

3. **Update State Management**
   - Create/update services for participant management
   - Implement form validation
   - Handle participant state updates

4. **Refactor Components**
   - Break down the large component into smaller ones
   - Move template logic to components
   - Implement communication between components

5. **Testing**
   - Unit test each component in isolation
   - Test search functionality
   - Test form validation
   - Test participant addition/removal

6. **Optimization**
   - Implement change detection strategies
   - Add loading states
   - Optimize search performance
