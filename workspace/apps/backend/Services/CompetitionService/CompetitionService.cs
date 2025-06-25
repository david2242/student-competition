using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;
using Workspace.Backend.Services;

namespace Workspace.Backend.Services.CompetitionService;

public class CompetitionService : ICompetitionService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  private readonly UserManager<IdentityUser> _userManager;
  private readonly IHttpContextAccessor _httpContextAccessor;
  
  private async Task<Student> FindOrCreateStudentAsync(ParticipantDto participantDto)
  {
    if (participantDto.StudentId.HasValue)
    {
      var student = await _context.Students
        .AsNoTracking()
        .FirstOrDefaultAsync(s => s.Id == participantDto.StudentId.Value);
        
      return student ?? throw new KeyNotFoundException($"Student with ID {participantDto.StudentId} not found");
    }
    
    // Check if a student with the same name is already being tracked
    var existingStudent = _context.ChangeTracker.Entries<Student>()
      .FirstOrDefault(e => 
        e.Entity.FirstName.Equals(participantDto.FirstName.Trim(), StringComparison.OrdinalIgnoreCase) &&
        e.Entity.LastName.Equals(participantDto.LastName.Trim(), StringComparison.OrdinalIgnoreCase))
      ?.Entity;
      
    if (existingStudent != null)
    {
      return existingStudent;
    }
    
    var newStudent = new Student
    {
      FirstName = participantDto.FirstName.Trim(),
      LastName = participantDto.LastName.Trim()
    };
    
    _context.Students.Add(newStudent);
    await _context.SaveChangesAsync();
    
    return newStudent;
  }

  public CompetitionService(
    IMapper mapper,
    DataContext context,
    UserManager<IdentityUser> userManager,
    IHttpContextAccessor httpContextAccessor)
  {
    _mapper = mapper;
    _context = context;
    _userManager = userManager;
    _httpContextAccessor = httpContextAccessor;
  }

  private string? GetCurrentUserId()
  {
    return _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
  }

  private async Task<bool> IsUserInRoleAsync(string userId, string role)
  {
    if (string.IsNullOrEmpty(userId)) return false;
    
    var user = await _userManager.FindByIdAsync(userId);
    return user != null && await _userManager.IsInRoleAsync(user, role);
  }

  private async Task<bool> HasPermissionToModifyCompetition(int competitionId, string userId)
  {
    if (string.IsNullOrEmpty(userId)) return false;
    if (await IsUserInRoleAsync(userId, "admin")) return true;
    if (!await IsUserInRoleAsync(userId, "contributor")) return false;

    var competition = await _context.Competitions
      .AsNoTracking()
      .FirstOrDefaultAsync(c => c.Id == competitionId);

    return competition?.CreatorId == userId;
  }
  
  private async Task ValidateUserPermissions(string userId, bool requireAdmin = false)
  {
    if (string.IsNullOrEmpty(userId))
    {
      throw new UnauthorizedAccessException("User not authenticated");
    }

    var user = await _userManager.FindByIdAsync(userId) ?? 
      throw new UnauthorizedAccessException("User not found");

    var isAdmin = await _userManager.IsInRoleAsync(user, "admin");
    var isContributor = await _userManager.IsInRoleAsync(user, "contributor");

    if (requireAdmin && !isAdmin)
    {
      throw new UnauthorizedAccessException("Admin privileges required");
    }

    if (!isAdmin && !isContributor)
    {
      throw new UnauthorizedAccessException("Insufficient permissions");
    }
  }

  private GetCompetitionResponseDto? MapCompetitionToDto(Competition? competition, string? creatorId = null)
  {
    if (competition == null)
    {
      return null;
    }

    var dto = new GetCompetitionResponseDto
    {
      Id = competition.Id,
      Name = competition.Name,
      Location = competition.Location,
      Subject = competition.Subject,
      Teacher = competition.Teacher,
      Date = competition.Date,
      Level = competition.Level,
      Round = competition.Round,
      Other = competition.Other,
      CreatorId = creatorId ?? competition.CreatorId,
      Created = competition.Created,
      UpdatedAt = competition.UpdatedAt,
      Result = competition.Result,
      Participants = competition.CompetitionParticipants?.Select(cp => new ParticipantDto
      {
        StudentId = cp.StudentId,
        FirstName = cp.Student?.FirstName ?? "Unknown",
        LastName = cp.Student?.LastName ?? "Student",
        ClassYear = cp.ClassYear,
        ClassLetter = cp.ClassLetter,
        SchoolYear = cp.SchoolYear
      }).ToArray() ?? Array.Empty<ParticipantDto>(),
      Forms = competition.Forms ?? Array.Empty<string>()
    };

    return dto;
  }

  private static IQueryable<Competition> CompetitionIncludes(IQueryable<Competition> query)
  {
    return query
      .Include(c => c.CompetitionParticipants)
        .ThenInclude(cp => cp.Student)
      .Include(c => c.Creator);
  }

  public async Task<List<GetCompetitionResponseDto>> GetAll()
  {
    var competitions = await CompetitionIncludes(_context.Competitions)
      .ToListAsync();

    return competitions
      .Select(c => MapCompetitionToDto(c, c.CreatorId))
      .Where(dto => dto != null)
      .Select(dto => dto!)
      .ToList();
  }

  public async Task<GetCompetitionResponseDto> GetSingle(int id)
  {
    var competition = await CompetitionIncludes(_context.Competitions)
      .FirstOrDefaultAsync(x => x.Id == id);

    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with ID {id} not found");
    }

    var result = MapCompetitionToDto(competition, competition.CreatorId);
    if (result == null)
    {
      throw new InvalidOperationException($"Failed to map competition with ID {id} to DTO");
    }
    return result;
  }

  public async Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition, string currentUserId)
  {
    await ValidateUserPermissions(currentUserId);

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      // Create and save the competition
      var competition = _mapper.Map<Competition>(newCompetition);
      competition.Created = DateTime.UtcNow;
      competition.UpdatedAt = DateTime.UtcNow;
      competition.CreatorId = currentUserId;
      competition.Forms = newCompetition.Forms?.ToArray() ?? Array.Empty<string>();
      
      _context.Competitions.Add(competition);
      await _context.SaveChangesAsync();

      // Add participants if any
      if (newCompetition.Participants?.Any() == true)
      {
        foreach (var participantDto in newCompetition.Participants)
        {
          var student = await FindOrCreateStudentAsync(participantDto);
          
          var participant = new CompetitionParticipant(
            competitionId: competition.Id,
            studentId: student.Id,
            classYear: participantDto.ClassYear,
            classLetter: participantDto.ClassLetter,
            schoolYear: participantDto.SchoolYear
          )
          {
            UpdatedAt = DateTime.UtcNow
          };
          
          _context.CompetitionParticipants.Add(participant);
        }
        
        await _context.SaveChangesAsync();
      }

      await transaction.CommitAsync();

      // Return all competitions
      var allCompetitions = await CompetitionIncludes(_context.Competitions)
        .ToListAsync();

      return allCompetitions
        .Select(c => MapCompetitionToDto(c, c.CreatorId))
        .Where(dto => dto != null)
        .Select(dto => dto!)
        .ToList();
    }
    catch (DbUpdateException dbEx)
    {
      await transaction.RollbackAsync();
      var errorMessage = dbEx.InnerException?.Message ?? dbEx.Message;
      throw new Exception($"Database error: {errorMessage}", dbEx);
    }
    catch (Exception ex)
    {
      await transaction.RollbackAsync();
      throw new Exception($"An error occurred while adding competition: {ex.Message}", ex);
    }
  }

  public async Task<GetCompetitionResponseDto> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition, string currentUserId)
  {
    if (updatedCompetition == null)
    {
      throw new ArgumentNullException(nameof(updatedCompetition));
    }
    
    var competition = await _context.Competitions
      .Include(c => c.CompetitionParticipants)
      .FirstOrDefaultAsync(x => x.Id == id) ?? throw new KeyNotFoundException($"Competition with ID {id} not found");

    // Check permissions
    var isAdmin = await IsUserInRoleAsync(currentUserId, "admin");
    if (competition.CreatorId != currentUserId && !isAdmin)
    {
      throw new UnauthorizedAccessException("You can only update competitions you created");
    }

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      _mapper.Map(updatedCompetition, competition);
      competition.UpdatedAt = DateTime.UtcNow;

      // Update participants
      _context.CompetitionParticipants.RemoveRange(competition.CompetitionParticipants);
      
      if (updatedCompetition.Participants?.Any() == true)
      {
        foreach (var participantDto in updatedCompetition.Participants)
        {
          var student = await FindOrCreateStudentAsync(participantDto);
          
          var participant = new CompetitionParticipant(
            competitionId: competition.Id,
            studentId: student.Id,
            classYear: participantDto.ClassYear,
            classLetter: participantDto.ClassLetter,
            schoolYear: updatedCompetition.Date.Year
          )
          {
            UpdatedAt = DateTime.UtcNow
          };
          
          _context.CompetitionParticipants.Add(participant);
        }
      }

      
      competition.Forms = updatedCompetition.Forms?.ToArray() ?? Array.Empty<string>();
      await _context.SaveChangesAsync();
      await transaction.CommitAsync();

      // Reload the competition with all includes
      var updatedCompetitionResult = await CompetitionIncludes(_context.Competitions)
        .FirstOrDefaultAsync(c => c.Id == id) ?? 
        throw new KeyNotFoundException($"Competition with ID {id} not found after update");

      return MapCompetitionToDto(updatedCompetitionResult, updatedCompetitionResult.CreatorId) ??
        throw new InvalidOperationException($"Failed to map updated competition with ID {id} to DTO");
    }
    catch (Exception ex)
    {
      await transaction.RollbackAsync();
      throw new Exception($"Failed to update competition: {ex.Message}", ex);
    }
  }

  public async Task<List<GetCompetitionResponseDto>> DeleteCompetition(int id, string currentUserId)
  {
    var isAdmin = await IsUserInRoleAsync(currentUserId, "admin");
    
    var competition = await _context.Competitions
      .Include(c => c.CompetitionParticipants)
      .FirstOrDefaultAsync(x => x.Id == id) ?? 
      throw new KeyNotFoundException($"Competition with ID {id} not found");

    // Only allow admins or the creator to delete the competition
    if (competition.CreatorId != currentUserId && !isAdmin)
    {
      throw new UnauthorizedAccessException("You can only delete competitions you created");
    }

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      // Remove all related competition participants
      _context.CompetitionParticipants.RemoveRange(competition.CompetitionParticipants);
      
      // Remove the competition
      _context.Competitions.Remove(competition);
      
      await _context.SaveChangesAsync();
      await transaction.CommitAsync();

      // Return the updated list of competitions
      return await GetAll();
    }
    catch (Exception ex)
    {
      await transaction.RollbackAsync();
      throw new Exception($"Failed to delete competition: {ex.Message}", ex);
    }
  }
}
