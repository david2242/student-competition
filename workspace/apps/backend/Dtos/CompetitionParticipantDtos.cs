using System.ComponentModel.DataAnnotations;

namespace Workspace.Backend.Dtos;

public class ParticipantBaseDto
{
    [Range(1, 12, ErrorMessage = "Class year must be between 1 and 12")]
    public int ClassYear { get; set; }
    
    [Required]
    [StringLength(1, ErrorMessage = "Class letter must be a single character")]
    public string ClassLetter { get; set; } = string.Empty;
}

public class ParticipantDto : ParticipantBaseDto
{
    // For existing students
    public int? StudentId { get; set; }
    
    // For new students
    [MaxLength(100)]
    public string? FirstName { get; set; }
    
    [MaxLength(100)]
    public string? LastName { get; set; }
}

public class ParticipantResponseDto
{
    public int StudentId { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}";
    public int ClassYear { get; set; }
    public string ClassLetter { get; set; } = string.Empty;
    public DateTime JoinedAt { get; set; }
}

public class AddParticipantDto
{
    [Required]
    public int StudentId { get; set; }
    
    [Required]
    [Range(1, 12, ErrorMessage = "Class year must be between 1 and 12")]
    public int ClassYear { get; set; }
    
    [Required]
    [StringLength(1, MinimumLength = 1, ErrorMessage = "Class letter must be a single character")]
    public string ClassLetter { get; set; } = string.Empty;
}
