using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Workspace.Backend.Dtos.Student;

public class StudentSearchResultDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public int? CurrentClassYear { get; set; }
    public string? CurrentClassLetter { get; set; }
    public List<StudentParticipationDto> Participations { get; set; } = new();
    
    public string FullName => $"{FirstName} {LastName}";
}

public class StudentSearchResponseDto
{
    public List<StudentSearchResultDto> Results { get; set; } = new();
    public int TotalCount { get; set; }
}

public class StudentParticipationDto
{
    public int CompetitionId { get; set; }
    public string CompetitionName { get; set; } = string.Empty;
    public DateTime CompetitionDate { get; set; }
    public int ClassYear { get; set; }
    public string ClassLetter { get; set; } = string.Empty;
    public int SchoolYear { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class StudentSearchRequestDto
{
    [Required(ErrorMessage = "Search query is required")]
    public string Query { get; set; } = string.Empty;
    
    [Range(1, int.MaxValue, ErrorMessage = "Limit must be greater than 0")]
    public int Limit { get; set; } = 5;
    
    public int? SchoolYear { get; set; }
    public int? ClassYear { get; set; }
    public string? ClassLetter { get; set; }
}
