using System.ComponentModel.DataAnnotations;
using System.ComponentModel;
using System.Text.Json.Serialization;

namespace Workspace.Backend.Dtos.Competition;

public class ParticipantDto
{
    /// <summary>
    /// Required when associating with an existing student
    /// </summary>
    public int? StudentId { get; set; }

    /// <summary>
    /// Required when creating a new student (when StudentId is not provided)
    /// </summary>
    [RequiredIfNot(nameof(StudentId), ErrorMessage = "First name is required when creating a new student")]
    public string? FirstName { get; set; }

    /// <summary>
    /// Required when creating a new student (when StudentId is not provided)
    /// </summary>
    [RequiredIfNot(nameof(StudentId), ErrorMessage = "Last name is required when creating a new student")]
    public string? LastName { get; set; }

    [Required(ErrorMessage = "Class year is required")]
    [Range(1, 13, ErrorMessage = "Class year must be between 1 and 13")]
    public int ClassYear { get; set; }

    [Required(ErrorMessage = "Class letter is required")]
    [StringLength(1, ErrorMessage = "Class letter must be a single character")]
    public string ClassLetter { get; set; } = string.Empty;

    [JsonIgnore]
    public int SchoolYear { get; set; } // Will be set by the service based on competition date
}

/// <summary>
/// Validation attribute that makes a property required when another property is not set
/// </summary>
[AttributeUsage(AttributeTargets.Property, AllowMultiple = false)]
public class RequiredIfNotAttribute : ValidationAttribute
{
    private readonly string _otherProperty;
    private const string DefaultErrorMessage = "The {0} field is required when {1} is not provided.";

    public RequiredIfNotAttribute(string otherProperty, string errorMessage = null)
        : base(errorMessage ?? string.Format(DefaultErrorMessage, "{0}", otherProperty))
    {
        _otherProperty = otherProperty;
    }

    protected override ValidationResult IsValid(object value, ValidationContext validationContext)
    {
        var otherPropertyInfo = validationContext.ObjectType.GetProperty(_otherProperty);
        if (otherPropertyInfo == null)
        {
            return new ValidationResult($"Unknown property: {_otherProperty}");
        }

        var otherPropertyValue = otherPropertyInfo.GetValue(validationContext.ObjectInstance, null);

        if (otherPropertyValue == null || otherPropertyValue.Equals(GetDefaultValue(otherPropertyInfo.PropertyType)))
        {
            if (value == null || (value is string strValue && string.IsNullOrWhiteSpace(strValue)))
            {
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
            }
        }

        return ValidationResult.Success;
    }

    private static object GetDefaultValue(Type type)
    {
        return type.IsValueType ? Activator.CreateInstance(type) : null;
    }
}
