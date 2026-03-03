using AutoMapper;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using Workspace.Backend;

namespace Workspace.Backend.Test.Infrastructure;

public abstract class TestBase<T> where T : class
{
    protected IMapper Mapper { get; private set; } = null!;
    protected Mock<ILogger<T>> LoggerMock { get; private set; } = null!;

    [SetUp]
    public virtual void Setup()
    {
        // Configure AutoMapper
        var config = new MapperConfiguration(cfg =>
        {
            cfg.AddProfile<AutoMapperProfile>();
        });
        Mapper = config.CreateMapper();

        // Configure Mock Logger
        LoggerMock = new Mock<ILogger<T>>();
    }
}
