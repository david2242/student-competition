using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Dtos.LanguageExam;
using Workspace.Backend.Models;
using Workspace.Backend.Services.LanguageExamService;

namespace Workspace.Backend.Controllers;

[ApiController]
[Route("api/language-exams")]
public class LanguageExamsController : ControllerBase
{
  private readonly ILanguageExamService _service;

  public LanguageExamsController(ILanguageExamService service)
  {
    _service = service;
  }

  [HttpGet(""), Authorize(Roles = "admin,contributor,viewer")]
  public async Task<IActionResult> GetAll()
  {
    var result = await _service.GetAllAsync();
    return Ok(new ServiceResponse<List<GetLanguageExamResponseDto>> { Data = result });
  }

  [HttpGet("search"), Authorize(Roles = "admin,contributor,viewer")]
  public async Task<IActionResult> Search([FromQuery] LanguageExamSearchRequestDto request)
  {
    var result = await _service.SearchAsync(request);
    return Ok(new ServiceResponse<List<GetLanguageExamResponseDto>> { Data = result });
  }

  [HttpGet("{id}"), Authorize(Roles = "admin,contributor,viewer")]
  public async Task<IActionResult> GetSingle(int id)
  {
    var result = await _service.GetSingleAsync(id);
    return Ok(new ServiceResponse<GetLanguageExamResponseDto> { Data = result });
  }

  [HttpPost(""), Authorize(Roles = "admin,contributor")]
  public async Task<IActionResult> Add([FromBody] AddLanguageExamRequestDto dto)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      return Unauthorized(new ServiceResponse<GetLanguageExamResponseDto> { Success = false, Message = "User not authenticated" });

    var result = await _service.AddAsync(dto, userId);
    return Ok(new ServiceResponse<GetLanguageExamResponseDto> { Data = result });
  }

  [HttpPut("{id}"), Authorize(Roles = "admin,contributor")]
  public async Task<IActionResult> Update(int id, [FromBody] UpdateLanguageExamRequestDto dto)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      return Unauthorized(new ServiceResponse<GetLanguageExamResponseDto> { Success = false, Message = "User not authenticated" });

    var result = await _service.UpdateAsync(id, dto, userId);
    return Ok(new ServiceResponse<GetLanguageExamResponseDto> { Data = result });
  }

  [HttpDelete("{id}"), Authorize(Roles = "admin,contributor")]
  public async Task<IActionResult> Delete(int id)
  {
    var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (string.IsNullOrEmpty(userId))
      return Unauthorized(new ServiceResponse<bool> { Success = false, Message = "User not authenticated" });

    var result = await _service.DeleteAsync(id, userId);
    return Ok(new ServiceResponse<bool> { Data = result });
  }
}
