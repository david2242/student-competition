using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.CompetitionService;

public class CompetitionService : ICompetitionService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  private readonly UserManager<IdentityUser> _userManager;
  private readonly IHttpContextAccessor _httpContextAccessor;

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
    var user = await _userManager.FindByIdAsync(userId);
    if (user == null) return false;
    return await _userManager.IsInRoleAsync(user, role);
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

  private GetCompetitionResponseDto MapCompetitionToDto(Competition competition, string? creatorId)
  {
    var dto = _mapper.Map<GetCompetitionResponseDto>(competition);
    dto.CreatorId = creatorId;
    return dto;
  }

  public async Task<List<GetCompetitionResponseDto>> GetAll()
  {
    var competitions = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .ThenInclude(cs => cs.Student)
      .Include(c => c.CompetitionForms)
      .ThenInclude(cf => cf.Form)
      .Include(c => c.Creator)
      .Select(c => new 
      {
        Competition = c,
        c.CreatorId
      })
      .ToListAsync();

    return competitions.Select(c => MapCompetitionToDto(c.Competition, c.CreatorId)).ToList();
  }

  public async Task<GetCompetitionResponseDto> GetSingle(int id)
  {
    var competition = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .ThenInclude(cs => cs.Student)
      .Include(c => c.CompetitionForms)
      .ThenInclude(cf => cf.Form)
      .Include(c => c.Creator)
      .Where(x => x.Id == id)
      .Select(c => new 
      {
        Competition = c,
        c.CreatorId
      })
      .FirstOrDefaultAsync();

    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }

    return MapCompetitionToDto(competition.Competition, competition.CreatorId);
  }

  public async Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition)
  {
    var currentUserId = GetCurrentUserId();
    if (string.IsNullOrEmpty(currentUserId))
    {
      throw new UnauthorizedAccessException("User must be logged in to create a competition");
    }

    var isContributor = await IsUserInRoleAsync(currentUserId, "contributor");
    var isAdmin = await IsUserInRoleAsync(currentUserId, "admin");

    if (!isContributor && !isAdmin)
    {
      throw new UnauthorizedAccessException("Only contributors and admins can create competitions");
    }

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      var competition = _mapper.Map<Competition>(newCompetition);
      competition.Created = DateTime.UtcNow;
      competition.CreatorId = currentUserId;
      await _context.Competitions.AddAsync(competition);
      await _context.SaveChangesAsync();

      foreach (var studentDto in newCompetition.Students)
      {
        var existingStudent = await _context.Students
          .FirstOrDefaultAsync(s => s.Name == studentDto.Name && s.Class == studentDto.Class);

        Student student;

        if (existingStudent != null)
        {
          student = existingStudent;
        }
        else
        {
          student = _mapper.Map<Student>(studentDto);
          await _context.Students.AddAsync(student);
          await _context.SaveChangesAsync();
        }

        var competitionStudent = new CompetitionStudent
        {
          CompetitionId = competition.Id,
          StudentId = student.Id
        };

        await _context.CompetitionStudent.AddAsync(competitionStudent);
      }

      if (newCompetition.Forms != null && newCompetition.Forms.Length > 0)
      {
        var forms = await _context.Forms
          .Where(f => newCompetition.Forms.Contains(f.Name))
          .ToListAsync();

        foreach (var form in forms)
        {
          var competitionForm = new CompetitionForm
          {
            CompetitionId = competition.Id,
            FormId = form.Id
          };
          await _context.CompetitionForms.AddAsync(competitionForm);
        }
      }

      await _context.SaveChangesAsync();
      await transaction.CommitAsync();

      var updatedCompetitions = await _context.Competitions
        .Include(c => c.CompetitionStudents)
        .ThenInclude(cs => cs.Student)
        .Include(c => c.CompetitionForms)
        .ThenInclude(cf => cf.Form)
        .ToListAsync();

      return updatedCompetitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
    }
    catch (Exception e)
    {
      await transaction.RollbackAsync();
      throw new Exception($"Failed to create competition: {e.Message}");
    }
  }

  public async Task<GetCompetitionResponseDto> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
  {
    var currentUserId = GetCurrentUserId();
    if (string.IsNullOrEmpty(currentUserId))
    {
      throw new UnauthorizedAccessException("User must be logged in to update a competition");
    }

    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      var competition = await _context.Competitions
        .Include(c => c.CompetitionStudents)
        .Include(c => c.CompetitionForms)
        .FirstOrDefaultAsync(x => x.Id == id);

      if (competition == null)
      {
        throw new KeyNotFoundException($"Competition with id '{id}' was not found");
      }

      if (!await HasPermissionToModifyCompetition(id, currentUserId))
      {
        throw new UnauthorizedAccessException("You don't have permission to update this competition");
      }

      _mapper.Map(updatedCompetition, competition);

      var existingStudents = _context.CompetitionStudent
        .Where(cs => cs.CompetitionId == id);
      _context.CompetitionStudent.RemoveRange(existingStudents);

      if (updatedCompetition.Students.Any())
      {
        foreach (var studentDto in updatedCompetition.Students)
        {
          var existingStudent = await _context.Students
            .FirstOrDefaultAsync(s => s.Name == studentDto.Name && s.Class == studentDto.Class);

          Student student;

          if (existingStudent != null)
          {
            student = existingStudent;
          }
          else
          {
            student = _mapper.Map<Student>(studentDto);
            await _context.Students.AddAsync(student);
            await _context.SaveChangesAsync();
          }

          var competitionStudent = new CompetitionStudent
          {
            CompetitionId = competition.Id,
            StudentId = student.Id
          };

          await _context.CompetitionStudent.AddAsync(competitionStudent);
        }
      }

      var existingForms = _context.CompetitionForms
        .Where(cf => cf.CompetitionId == id);
      _context.CompetitionForms.RemoveRange(existingForms);

      if (updatedCompetition.Forms != null && updatedCompetition.Forms.Length > 0)
      {
        var forms = await _context.Forms
          .Where(f => updatedCompetition.Forms.Contains(f.Name))
          .ToListAsync();

        foreach (var form in forms)
        {
          var competitionForm = new CompetitionForm
          {
            CompetitionId = competition.Id,
            FormId = form.Id
          };
          await _context.CompetitionForms.AddAsync(competitionForm);
        }
      }


      await _context.SaveChangesAsync();
      await transaction.CommitAsync();

      competition = await _context.Competitions
        .Include(c => c.CompetitionStudents)
        .ThenInclude(cs => cs.Student)
        .Include(c => c.CompetitionForms)
        .ThenInclude(cf => cf.Form)
        .FirstOrDefaultAsync(x => x.Id == id);

      return _mapper.Map<GetCompetitionResponseDto>(competition);
    }
    catch (Exception e)
    {
      await transaction.RollbackAsync();
      throw new Exception($"Failed to update competition: {e.Message}");
    }
  }

  public async Task<List<GetCompetitionResponseDto>> DeleteCompetition(int id)
  {
    var currentUserId = GetCurrentUserId();
    if (string.IsNullOrEmpty(currentUserId))
    {
      throw new UnauthorizedAccessException("User must be logged in to delete a competition");
    }

    if (!await IsUserInRoleAsync(currentUserId, "admin"))
    {
      throw new UnauthorizedAccessException("Only admins can delete competitions");
    }

    var competition = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .Include(c => c.CompetitionForms)
      .FirstOrDefaultAsync(x => x.Id == id);

    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }

    if (!await HasPermissionToModifyCompetition(id, currentUserId))
    {
      throw new UnauthorizedAccessException("You don't have permission to delete this competition");
    }

    _context.CompetitionStudent.RemoveRange(competition.CompetitionStudents);
    _context.CompetitionForms.RemoveRange(competition.CompetitionForms);
    _context.Competitions.Remove(competition);
    await _context.SaveChangesAsync();

    var competitions = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .ThenInclude(cs => cs.Student)
      .Include(c => c.CompetitionForms)
      .ThenInclude(cf => cf.Form)
      .ToListAsync();

    return competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }
}
