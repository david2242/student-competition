using System.Threading.Tasks;
using Workspace.Backend.Dtos.Student;

namespace Workspace.Backend.Services.StudentService
{
    public interface IStudentService
    {
        /// <summary>
        /// Searches for students based on the provided criteria
        /// </summary>
        /// <param name="searchRequest">Search criteria</param>
        /// <returns>Search results with pagination info</returns>
        Task<StudentSearchResponseDto> SearchStudentsAsync(StudentSearchRequestDto searchRequest);
    }
}
