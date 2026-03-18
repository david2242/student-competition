using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Workspace.Backend.Dtos.Competition;
using Workspace.Backend.Models;
using Workspace.Backend.Services.CompetitionService;

namespace Workspace.Backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CompetitionController : ControllerBase
{
    private readonly ICompetitionService _competitionService;

    public CompetitionController(ICompetitionService competitionService)
    {
        _competitionService = competitionService;
    }

    [HttpGet(""), Authorize(Roles = "admin,contributor,viewer")]
    public async Task<IActionResult> GetAll()
    {
        var result = await _competitionService.GetAll();
        return Ok(new ServiceResponse<List<GetCompetitionResponseDto>> { Data = result });
    }

    [HttpGet("search"), Authorize(Roles = "admin,contributor,viewer")]
    public async Task<IActionResult> Search([FromQuery] CompetitionSearchRequestDto request)
    {
        var result = await _competitionService.SearchCompetitionsAsync(request);
        return Ok(new ServiceResponse<List<GetCompetitionResponseDto>> { Data = result });
    }

    [HttpGet("{id}"), Authorize(Roles = "admin,contributor,viewer")]
    public async Task<IActionResult> GetSingle(int id)
    {
        var result = await _competitionService.GetSingle(id);
        return Ok(new ServiceResponse<GetCompetitionResponseDto> { Data = result });
    }

    [HttpPost, Authorize(Roles = "admin,contributor")]
    public async Task<IActionResult> AddCompetition(AddCompetitionRequestDto newCompetition)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized(new ServiceResponse<List<GetCompetitionResponseDto>> { Success = false, Message = "User not authenticated" });
        }

        var result = await _competitionService.AddCompetition(newCompetition, currentUserId);
        return Ok(new ServiceResponse<List<GetCompetitionResponseDto>> { Data = result });
    }

    [HttpPut("{id}"), Authorize(Roles = "admin,contributor")]
    public async Task<IActionResult> UpdateCompetition(int id, UpdateCompetitionRequestDto updatedCompetition)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized(new ServiceResponse<GetCompetitionResponseDto> { Success = false, Message = "User not authenticated" });
        }

        var result = await _competitionService.UpdateCompetition(id, updatedCompetition, currentUserId);
        return Ok(new ServiceResponse<GetCompetitionResponseDto> { Data = result });
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin,contributor")]
    public async Task<IActionResult> DeleteCompetition(int id)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId))
        {
            return Unauthorized(new ServiceResponse<List<GetCompetitionResponseDto>> { Success = false, Message = "User not authenticated" });
        }

        var result = await _competitionService.DeleteCompetition(id, currentUserId);
        return Ok(new ServiceResponse<List<GetCompetitionResponseDto>> { Data = result });
    }
}
