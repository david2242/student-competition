using Workspace.Backend.Dtos.Student;

namespace Workspace.Backend.Services.StudentService;

public interface IStudentService
{
  Task<List<GetStudentResponseDto>> GetAll();
  Task<GetStudentResponseDto> GetSingle(int id);
  Task<List<GetStudentResponseDto>> AddStudent(AddStudentRequestDto newStudent);
  Task<GetStudentResponseDto> UpdateStudent(int id, UpdateStudentRequestDto updatedStudent);
  Task<List<GetStudentResponseDto>> DeleteStudent(int id);
}
