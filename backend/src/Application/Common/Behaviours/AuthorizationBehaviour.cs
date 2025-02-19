using System.Reflection;
using backend.Application.Common.Exceptions;
using backend.Application.Common.Interfaces;
using backend.Application.Common.Security;

namespace backend.Application.Common.Behaviours;

public class AuthorizationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    private readonly IUser _user;
    private readonly IIdentityService _identityService;

    public AuthorizationBehaviour(
        IUser user,
        IIdentityService identityService)
    {
        _user = user;
        _identityService = identityService;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken)
    {
        var authorizeAttributes = request.GetType().GetCustomAttributes<AuthorizeAttribute>();

        if (authorizeAttributes.Any())
        {
            // Must be authenticated user
            if (_user.Id == null)
            {
                throw new UnauthorizedAccessException();
            }

            // Role-based authorization
            // Now we check if there is at least one role in the attribute
            var authorizeAttributesWithRoles = authorizeAttributes.Where(a => a.Roles != null && a.Roles.Any());

            if (authorizeAttributesWithRoles.Any())
            {
                var authorized = false;

                // Iterate over the role arrays in each attribute
                foreach (var roles in authorizeAttributesWithRoles.Select(a => a.Roles))
                {
                    foreach (var role in roles)
                    {
                        // If your identity service expects a string, use role.ToString()
                        var isInRole = await _identityService.IsInRoleAsync(_user.Id, role.ToString());
                        if (isInRole)
                        {
                            authorized = true;
                            break;
                        }
                    }
                    if (authorized)
                    {
                        break;
                    }
                }

                // Must be a member of at least one role
                if (!authorized)
                {
                    throw new ForbiddenAccessException();
                }
            }

            // Policy-based authorization
            var authorizeAttributesWithPolicies = authorizeAttributes.Where(a => !string.IsNullOrWhiteSpace(a.Policy));
            if (authorizeAttributesWithPolicies.Any())
            {
                foreach (var policy in authorizeAttributesWithPolicies.Select(a => a.Policy))
                {
                    var authorized = await _identityService.AuthorizeAsync(_user.Id, policy);

                    if (!authorized)
                    {
                        throw new ForbiddenAccessException();
                    }
                }
            }
        }

        // User is authorized / authorization not required
        return await next();
    }
}
