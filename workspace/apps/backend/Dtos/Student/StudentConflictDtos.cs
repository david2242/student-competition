using System.ComponentModel.DataAnnotations;
using Workspace.Backend.Dtos;

namespace Workspace.Backend.Dtos.Student;

public class StudentMatchDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public List<StudentParticipationDto> RecentParticipations { get; set; } = new();
}

public class StudentConflictDto
{
    public ParticipantBaseDto Proposed { get; set; } = null!;
    public List<StudentMatchDto> ExistingStudents { get; set; } = new();
}

public class StudentConflictCheckResult
{
    public bool HasConflicts => Conflicts.Count > 0;
    public List<StudentConflictDto> Conflicts { get; set; } = new();
}

public class StudentConflictResolutionDto : ParticipantBaseDto
{
    public int? StudentId { get; set; }  // If reusing existing student
    public string? FirstName { get; set; }  // If creating new student
    public string? LastName { get; set; }   // If creating new student
}
