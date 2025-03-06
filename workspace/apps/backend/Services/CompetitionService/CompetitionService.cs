using AutoMapper;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.CompetitionService;

public class CompetitionService : ICompetitionService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  public CompetitionService(IMapper mapper, DataContext context)
  {
    _mapper = mapper;
    _context = context;
  }
  public async Task<List<GetCompetitionResponseDto>> GetAll()
  {
    var competitions = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .ThenInclude(cs => cs.Student)
      .ToListAsync();
    return competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }

  public async Task<GetCompetitionResponseDto> GetSingle(int id)
  {
    var competition = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .ThenInclude(cs => cs.Student)
      .FirstOrDefaultAsync(x => x.Id == id);

    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }
    return _mapper.Map<GetCompetitionResponseDto>(competition);
  }

  public async Task<List<GetCompetitionResponseDto>> AddCompetition(AddCompetitionRequestDto newCompetition)
  {
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      var competition = _mapper.Map<Competition>(newCompetition);
      competition.Created = DateTime.UtcNow;
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
        await _context.SaveChangesAsync();
      }

      await transaction.CommitAsync();

      var updatedCompetitions = await _context.Competitions.ToListAsync();
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
    using var transaction = await _context.Database.BeginTransactionAsync();
    try
    {
      var competition = await _context.Competitions
        .Include(c => c.CompetitionStudents)
        .FirstOrDefaultAsync(x => x.Id == id);

      if (competition == null)
      {
        throw new KeyNotFoundException($"Competition with id '{id}' was not found");
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

      await _context.SaveChangesAsync();
      await transaction.CommitAsync();

      competition = await _context.Competitions
        .Include(c => c.CompetitionStudents)
        .ThenInclude(cs => cs.Student)
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
    var competition = await _context.Competitions
      .Include(c => c.CompetitionStudents)
      .FirstOrDefaultAsync(x => x.Id == id);
    if (competition == null)
    {
      throw new KeyNotFoundException($"Competition with id '{id}' was not found");
    }

    _context.CompetitionStudent.RemoveRange(competition.CompetitionStudents);
    _context.Competitions.Remove(competition);
    await _context.SaveChangesAsync();
    var competitions = await _context.Competitions.ToListAsync();
    return competitions.Select(c => _mapper.Map<GetCompetitionResponseDto>(c)).ToList();
  }
}
