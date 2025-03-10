﻿using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace Workspace.Backend.Models;

public class Student
{
  public int Id { get; set; }
  public string Name { get; set; }
  public string Class { get; set; }

  [JsonIgnore]
  public List<CompetitionStudent> CompetitionStudents { get; set; }

  public Student()
  {
    Name = string.Empty;
    Class = string.Empty;
    CompetitionStudents = new List<CompetitionStudent>();
  }
}
