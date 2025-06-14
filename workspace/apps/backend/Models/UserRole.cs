using System.Text.Json.Serialization;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserRole
{
    [JsonPropertyName("admin")]
    admin,
    [JsonPropertyName("contributor")]
    contributor,
    [JsonPropertyName("viewer")]
    viewer
}
