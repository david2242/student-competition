using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.LanguageExam;
using Workspace.Backend.Models;
using Workspace.Backend.Utils;

namespace Workspace.Backend.Services.LanguageExamService;

public class LanguageExamService : ILanguageExamService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  private readonly UserManager<IdentityUser> _userManager;

  public LanguageExamService(IMapper mapper, DataContext context, UserManager<IdentityUser> userManager)
  {
    _mapper = mapper;
    _context = context;
    _userManager = userManager;
  }

  private static IQueryable<LanguageExam> WithIncludes(IQueryable<LanguageExam> query)
  {
    return query.Include(e => e.Student).Include(e => e.Creator);
  }

  private async Task<bool> IsAdminAsync(string userId)
  {
    var user = await _userManager.FindByIdAsync(userId);
    return user != null && await _userManager.IsInRoleAsync(user, "admin");
  }

  public async Task<List<GetLanguageExamResponseDto>> GetAllAsync()
  {
    var exams = await WithIncludes(_context.LanguageExams)
      .OrderByDescending(e => e.Date)
      .ToListAsync();

    return exams.Select(e => _mapper.Map<GetLanguageExamResponseDto>(e)).ToList();
  }

  public async Task<List<GetLanguageExamResponseDto>> SearchAsync(LanguageExamSearchRequestDto request)
  {
    IQueryable<LanguageExam> query = WithIncludes(_context.LanguageExams);

    if (request.StudentId.HasValue)
      query = query.Where(e => e.StudentId == request.StudentId.Value);

    if (!string.IsNullOrWhiteSpace(request.StudentName))
    {
      var lower = request.StudentName.ToLower();
      query = query.Where(e =>
        e.Student.FirstName.ToLower().Contains(lower) ||
        e.Student.LastName.ToLower().Contains(lower));
    }

    if (!string.IsNullOrWhiteSpace(request.Language))
      query = query.Where(e => e.Language == request.Language);

    if (!string.IsNullOrWhiteSpace(request.Level))
      query = query.Where(e => e.Level == request.Level);

    if (!string.IsNullOrWhiteSpace(request.Type))
      query = query.Where(e => e.Type == request.Type);

    if (!string.IsNullOrWhiteSpace(request.Teacher))
    {
      var lower = request.Teacher.ToLower();
      query = query.Where(e => e.Teacher.ToLower().Contains(lower));
    }

    if (!string.IsNullOrWhiteSpace(request.ExamBody))
      query = query.Where(e => e.ExamBody == request.ExamBody);

    if (request.DateFrom.HasValue)
      query = query.Where(e => e.Date >= request.DateFrom.Value);

    if (request.DateTo.HasValue)
      query = query.Where(e => e.Date <= request.DateTo.Value);

    if (!string.IsNullOrWhiteSpace(request.SchoolYear) && int.TryParse(request.SchoolYear, out var schoolYearInt))
    {
      var startDate = new DateOnly(schoolYearInt, 9, 1);
      var endDate = new DateOnly(schoolYearInt + 1, 8, 31);
      query = query.Where(e => e.Date >= startDate && e.Date <= endDate);
    }

    var exams = await query.OrderByDescending(e => e.Date).ToListAsync();
    return exams.Select(e => _mapper.Map<GetLanguageExamResponseDto>(e)).ToList();
  }

  public async Task<GetLanguageExamResponseDto> GetSingleAsync(int id)
  {
    var exam = await WithIncludes(_context.LanguageExams)
      .FirstOrDefaultAsync(e => e.Id == id)
      ?? throw new KeyNotFoundException($"LanguageExam with ID {id} not found");

    return _mapper.Map<GetLanguageExamResponseDto>(exam);
  }

  public async Task<GetLanguageExamResponseDto> AddAsync(AddLanguageExamRequestDto dto, string userId)
  {
    var student = await _context.Students.FirstOrDefaultAsync(s => s.Id == dto.StudentId)
      ?? throw new KeyNotFoundException($"Student with ID {dto.StudentId} not found");

    var exam = new LanguageExam
    {
      StudentId = dto.StudentId,
      Language  = dto.Language,
      Level     = dto.Level,
      Type      = dto.Type,
      Teacher   = dto.Teacher,
      Date      = dto.Date,
      ExamBody  = dto.ExamBody,
      CreatedAt = DateTime.UtcNow,
      UpdatedAt = DateTime.UtcNow,
      CreatorId = userId
    };

    _context.LanguageExams.Add(exam);
    await _context.SaveChangesAsync();

    var created = await WithIncludes(_context.LanguageExams)
      .FirstOrDefaultAsync(e => e.Id == exam.Id)
      ?? throw new InvalidOperationException("Failed to reload created exam");

    return _mapper.Map<GetLanguageExamResponseDto>(created);
  }

  public async Task<GetLanguageExamResponseDto> UpdateAsync(int id, UpdateLanguageExamRequestDto dto, string userId)
  {
    var exam = await _context.LanguageExams.FirstOrDefaultAsync(e => e.Id == id)
      ?? throw new KeyNotFoundException($"LanguageExam with ID {id} not found");

    var isAdmin = await IsAdminAsync(userId);
    if (exam.CreatorId != userId && !isAdmin)
      throw new UnauthorizedAccessException("Ezt a bejegyzést nem módosíthatja");

    if (!isAdmin && !SchoolYearHelper.IsCurrentSchoolYear(exam.Date))
      throw new UnauthorizedAccessException("Csak az aktuális tanév vizsgáit módosíthatja");

    _ = await _context.Students.FirstOrDefaultAsync(s => s.Id == dto.StudentId)
      ?? throw new KeyNotFoundException($"Student with ID {dto.StudentId} not found");

    exam.StudentId = dto.StudentId;
    exam.Language  = dto.Language;
    exam.Level     = dto.Level;
    exam.Type      = dto.Type;
    exam.Teacher   = dto.Teacher;
    exam.Date      = dto.Date;
    exam.ExamBody  = dto.ExamBody;
    exam.UpdatedAt = DateTime.UtcNow;

    await _context.SaveChangesAsync();

    var updated = await WithIncludes(_context.LanguageExams)
      .FirstOrDefaultAsync(e => e.Id == id)
      ?? throw new InvalidOperationException("Failed to reload updated exam");

    return _mapper.Map<GetLanguageExamResponseDto>(updated);
  }

  public async Task<bool> DeleteAsync(int id, string userId)
  {
    var exam = await _context.LanguageExams.FirstOrDefaultAsync(e => e.Id == id)
      ?? throw new KeyNotFoundException($"LanguageExam with ID {id} not found");

    var isAdmin = await IsAdminAsync(userId);
    if (exam.CreatorId != userId && !isAdmin)
      throw new UnauthorizedAccessException("Ezt a bejegyzést nem törölheti");

    if (!isAdmin && !SchoolYearHelper.IsCurrentSchoolYear(exam.Date))
      throw new UnauthorizedAccessException("Csak az aktuális tanév vizsgáit törölheti");

    _context.LanguageExams.Remove(exam);
    await _context.SaveChangesAsync();
    return true;
  }
}
