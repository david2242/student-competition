using AutoMapper;
using Workspace.Backend.Data;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Models;

namespace Workspace.Backend.Services.StudentService;

public class StudentService : IStudentService
{
  private readonly IMapper _mapper;
  private readonly DataContext _context;
  public StudentService(IMapper mapper, DataContext context)
  {
    _mapper = mapper;
    _context = context;
  }

  public async Task<List<GetStudentResponseDto>> GetAll()
  {
    var students = await _context.Students.ToListAsync();
    return students.Select(s => _mapper.Map<GetStudentResponseDto>(s)).ToList();
  }

  public async Task<GetStudentResponseDto> GetSingle(int id)
  {
    var student = await _context.Students.FirstOrDefaultAsync(x => x.Id == id);
    if (student == null)
    {
      throw new KeyNotFoundException($"Student with id '{id}' was not found");
    }
    return _mapper.Map<GetStudentResponseDto>(student);
  }

  public async Task<List<GetStudentResponseDto>> AddStudent(AddStudentRequestDto newStudent)
  {
    var student = _mapper.Map<Student>(newStudent);
    await _context.Students.AddAsync(_mapper.Map<Student>(student));
    await _context.SaveChangesAsync();
    var updatedStudents = await _context.Students.ToListAsync();
    return updatedStudents.Select(s => _mapper.Map<GetStudentResponseDto>(s)).ToList();
  }

  public async Task<GetStudentResponseDto> UpdateStudent(int id, UpdateStudentRequestDto updatedStudent)
  {
    var student = await _context.Students.FirstOrDefaultAsync(x => x.Id == id);
    if (student == null)
    {
      throw new KeyNotFoundException($"Student with id '{id}' was not found");
    }
    _mapper.Map(updatedStudent, student);
    await _context.SaveChangesAsync();
    return _mapper.Map<GetStudentResponseDto>(student);
  }

  public async Task<List<GetStudentResponseDto>> DeleteStudent(int id)
  {
    var student = await _context.Students.FirstOrDefaultAsync(x => x.Id == id);
    if (student == null)
    {
      throw new KeyNotFoundException($"Student with id '{id}' was not found");
    }
    _context.Students.Remove(student);
    await _context.SaveChangesAsync();
    var updatedStudents = await _context.Students.ToListAsync();
    return updatedStudents.Select(s => _mapper.Map<GetStudentResponseDto>(s)).ToList();
  }
}
