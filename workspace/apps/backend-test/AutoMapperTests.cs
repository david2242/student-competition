using AutoMapper;
using NUnit.Framework;

namespace Workspace.Backend.Test;

[TestFixture]
public class AutoMapperTests
{
    [Test]
    public void AutoMapper_Configuration_Is_Valid()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<AutoMapperProfile>());
        config.AssertConfigurationIsValid();
    }
}
