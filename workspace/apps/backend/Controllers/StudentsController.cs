using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Logging;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Models;
using Workspace.Backend.Services.StudentService;

namespace Workspace.Backend.Controllers;

/// <summary>
/// API endpoints for searching and retrieving student information
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public class StudentsController : ControllerBase
{
    private readonly IStudentService _studentService;
    private const int DefaultSearchLimit = 5;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(IStudentService studentService, ILogger<StudentsController> logger)
    {
        _studentService = studentService;
        _logger = logger;
    }

    /// <summary>
    /// Searches for students by name with optional filters
    /// </summary>
    /// <param name="query">Search query (searches in first and last name)</param>
    /// <param name="limit">Maximum number of results to return (default: 5, max: 50)</param>
    /// <param name="schoolYear">Filter by school year</param>
    /// <param name="classYear">Filter by class year (1-12)</param>
    /// <param name="classLetter">Filter by class letter (A-Z)</param>
    /// <returns>List of matching students with their participation history</returns>
    [HttpGet("search")]
    [EnableRateLimiting("search")]
    [ProducesResponseType(typeof(ServiceResponse<StudentSearchResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ServiceResponse<StudentSearchResponseDto>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ServiceResponse<StudentSearchResponseDto>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> SearchStudents(
        [FromQuery, Required(ErrorMessage = "Search query is required")] string query,
        [FromQuery, Range(1, 50, ErrorMessage = "Limit must be between 1 and 50")] int? limit = null,
        [FromQuery] int? schoolYear = null,
        [FromQuery, Range(1, 12, ErrorMessage = "Class year must be between 1 and 12")] int? classYear = null,
        [FromQuery, StringLength(1, ErrorMessage = "Class letter must be a single character")] string? classLetter = null)
    {
        var searchRequest = new StudentSearchRequestDto
        {
            Query = query.Trim(),
            Limit = limit ?? DefaultSearchLimit,
            SchoolYear = schoolYear,
            ClassYear = classYear,
            ClassLetter = classLetter
        };

        if (!TryValidateModel(searchRequest))
        {
            var validationErrors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(new ServiceResponse<StudentSearchResponseDto>
            {
                Success = false,
                Message = "Invalid request parameters",
                Errors = validationErrors
            });
        }

        var result = await _studentService.SearchStudentsAsync(searchRequest);
        return Ok(new ServiceResponse<StudentSearchResponseDto> { Data = result });
    }
}
