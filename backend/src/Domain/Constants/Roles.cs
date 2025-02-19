using System.Text.Json.Serialization;

namespace backend.Domain.Constants;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum RolesEnum
{
    Administrator,
    // Add other roles here as needed
}
