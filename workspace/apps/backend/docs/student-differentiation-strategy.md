# 🎓 Student Differentiation - Implementation Strategy

## 🎯 Objective

Simplify the way students (participants) are handled in the competition management system to ensure:

- Streamlined student identification during competition creation
- Intuitive UI for handling potential student name conflicts
- Single transaction for competition and participant creation
- Maintain data integrity with proper student matching

## 🧱 Data Model

### `Student` Model

Represents a logical student entity (e.g., "László Bodri").

```csharp
public class Student
{
    public int Id { get; set; }
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public ICollection<CompetitionParticipant> CompetitionParticipants { get; set; } = new List<CompetitionParticipant>();
}
```

### `CompetitionParticipant` Model

Represents a student's participation in a competition, including contextual information like grade and class.

```csharp
public class CompetitionParticipant
{
    public int Id { get; set; }
    public int StudentId { get; set; }
    public Student Student { get; set; } = null!;
    public int CompetitionId { get; set; }
    public Competition Competition { get; set; } = null!;
    public int ClassYear { get; set; }           // E.g. 10, 11, 12
    public string ClassLetter { get; set; } = ""; // E.g. "B", "C"
    public int SchoolYear { get; set; }          // E.g. 2000 for school year 2000/2001
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
```

## 🔍 Student Matching Logic

### 1. Student Search (As You Type)

When a teacher types a student's name:

1. Frontend makes a search request with the current input
2. Backend performs a fuzzy search on student names
3. Returns potential matches with participation history

### 2. Participant Addition

When adding a participant:

1. Teacher can either:
   - Select an existing student from search results, or
   - Enter a new student's details
2. For existing students, the system shows their participation history
3. For new students, the system allows adding class information

### 3. Competition Creation

When creating a competition:
1. All participants (both existing and new) are sent in a single request
2. Backend processes everything in a single transaction:
   - Creates the competition
   - Creates any new students
   - Links all participants to the competition

This approach ensures data consistency and provides a smooth user experience.

## 🚀 Implementation Plan

### Phase 1: Backend API (Week 1)

#### 1. Student Search Endpoint
- [ ] Implement `POST /api/students/search`
  - Fuzzy name matching
  - Filter by class/year when available
  - Return participation history for each match

#### 2. Competition Creation Endpoint
- [ ] Implement `POST /api/competitions`
  - Accept competition details and participants in one request
  - Handle both existing and new students
  - Transactional creation of competition and participants


### Phase 2: Frontend (Week 2)

#### 1. Competition Form
- [ ] Participant management section in modal?
  - Search and add existing students
  - Add new students directly
  - Display selected participants

#### 2. Student Search Component
- [ ] Debounced search input
- [ ] Display search results with participation history
- [ ] Highlight potential matches

#### 3. Form Submission
- [ ] Client-side validation
- [ ] Loading states
- [ ] Error handling and user feedback

### Phase 3: Testing & Refinement (Week 3)

#### Backend Tests
- [ ] Unit tests for student matching logic
- [ ] Integration tests for competition creation
- [ ] Transaction rollback tests

#### Frontend Tests
- [ ] Component tests
- [ ] E2E test for competition creation
- [ ] Error handling tests

#### Performance
- [ ] Test with large datasets
- [ ] Optimize database queries
- [ ] Implement caching where needed

## 🛡️ Data Integrity

Add database constraint to prevent duplicate class assignments in the same school year:

```sql
CREATE UNIQUE INDEX ux_student_participation_per_year
ON CompetitionParticipants (StudentId, SchoolYear);
```

## 📈 Benefits

- Prevents accidental merging of different students with the same name
- Maintains clear history of each student's competition activity
- Enables flexible querying of student participation
- Supports accurate reporting and analytics
- Simplified workflow with single transaction for competition creation
- Better user experience with in-line conflict resolution

## API Design

### 1. Search Students
```http
GET /api/students/search?query=John+Doe&limit=5
```

**Query Parameters:**
- `query`: Search term (required)
- `limit`: Maximum number of results (default: 5)
- `schoolYear`: Filter by school year (optional)
- `classYear`: Filter by class year (optional)
- `classLetter`: Filter by class letter (optional)

**Response:**
```json
{
  "results": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "currentClassYear": 10,
      "currentClassLetter": "A",
      "participations": [
        {
          "competitionId": 42,
          "competitionName": "Math Olympiad 2024",
          "competitionDate": "2024-10-10T00:00:00",
          "classYear": 10,
          "classLetter": "A",
          "schoolYear": 2024,
          "createdAt": "2024-06-23T22:00:00Z"
        },
        {
          "competitionId": 24,
          "competitionName": "Math Olympiad 2023",
          "competitionDate": "2024-10-10T00:01:00",
          "classYear": 9,
          "classLetter": "B",
          "schoolYear": 2023,
          "createdAt": "2023-06-15T10:30:00Z"
        }
      ]
    }
  ]
}
```

### 2. Create Competition with Participants
```http
POST /api/competitions
```

**Request:**
```json
{
  "name": "Math Olympiad 2024",
  "date": "2024-11-15T09:00:00Z",
  "participants": [
    {
      "studentId": 1,  // For existing students
      "classYear": 10,
      "classLetter": "A"
    },
    {
      "firstName": "Jane",  // For new students
      "lastName": "Smith",
      "classYear": 10,
      "classLetter": "A"
    }
  ]
}
```

**Success Response (201 Created):**
```http
HTTP/1.1 201 Created
Location: /api/competitions/42
```

**Error Response (400 Bad Request):**
```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Validation Error",
  "status": 400,
  "errors": {
    "Name": ["The Name field is required."],
    "Date": ["The competition date must be in the future."]
  }
}
```

**Error Response (409 Conflict - Duplicate Competition):**
```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.8",
  "title": "Conflict",
  "status": 409,
  "detail": "A competition with the same name already exists in this school year."
}
```

## 📝 Notes

- Use string enums in the database with `HasConversion<string>()`
- Store class information in separate fields (numeric grade + class letter)
- Implement proper error handling for duplicate entries
- Add comprehensive logging for audit purposes
- Ensure proper transaction handling for competition creation
- Consider adding indexes for frequently queried fields
- Use database transactions for all operations that modify multiple records
- Implement proper error messages for duplicate student detection
- Add input validation for all user-provided data
- Consider adding rate limiting for API endpoints
- Implement proper CORS policies for web client access
- Add API versioning for future compatibility
