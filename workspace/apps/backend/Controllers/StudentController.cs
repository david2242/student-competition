using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Workspace.Backend.Dtos.Student;
using Workspace.Backend.Dtos.User;
using Workspace.Backend.Models;
using Workspace.Backend.Services.StudentService;
using Workspace.Backend.Services.UserService;

namespace Workspace.Backend.Controllers
{

  [ApiController]
  [Route("api/[controller]")]
  public class StudentController : ControllerBase
  {
    private readonly IStudentService _studentService;
    public StudentController(IStudentService studentService)
    {
      _studentService = studentService;
    }

    [HttpGet(""), Authorize]
    public async Task<ActionResult<ServiceResponse<List<GetStudentResponseDto>>>> GetAll()
    {
      var serviceResponse = new ServiceResponse<List<GetStudentResponseDto>>();
      try
      {
        serviceResponse.Data = await _studentService.GetAll();
        return Ok(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpGet("{id}"), Authorize]
    public async Task<ActionResult<ServiceResponse<GetStudentResponseDto>>> GetSingle(int id)
    {
      var serviceResponse = new ServiceResponse<GetStudentResponseDto>();
      try
      {
        serviceResponse.Data = await _studentService.GetSingle(id);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPost, Authorize]
    public async Task<ActionResult<ServiceResponse<List<GetStudentResponseDto>>>> AddStudent(AddStudentRequestDto newStudent)
    {
      var serviceResponse = new ServiceResponse<List<GetStudentResponseDto>>();
      try
      {
        serviceResponse.Data = await _studentService.AddStudent(newStudent);
        return Ok(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpPut("{id}"), Authorize]
    public async Task<ActionResult<ServiceResponse<GetStudentResponseDto>>> UpdateStudent(int id, UpdateStudentRequestDto updatedStudent)
    {
      var serviceResponse = new ServiceResponse<GetStudentResponseDto>();
      try
      {
        serviceResponse.Data = await _studentService.UpdateStudent(id, updatedStudent);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }

    [HttpDelete("{id}"), Authorize(Roles = "admin")]
    public async Task<ActionResult<ServiceResponse<List<GetStudentResponseDto>>>> DeleteStudent(int id)
    {
      var serviceResponse = new ServiceResponse<List<GetStudentResponseDto>>();
      try
      {
        serviceResponse.Data = await _studentService.DeleteStudent(id);
        return Ok(serviceResponse);
      }
      catch (KeyNotFoundException e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return NotFound(serviceResponse);
      }
      catch (Exception e)
      {
        serviceResponse.Data = null;
        serviceResponse.Success = false;
        serviceResponse.Message = e.Message;
        return BadRequest(serviceResponse);
      }
    }
  }
};
