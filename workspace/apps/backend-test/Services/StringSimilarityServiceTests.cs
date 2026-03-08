using FluentAssertions;
using NUnit.Framework;
using Workspace.Backend.Services;

namespace Workspace.Backend.Test.Services;

[TestFixture]
public class StringSimilarityServiceTests
{
    [TestCase("kitten", "sitting", 3)]
    [TestCase("flaw", "lawn", 2)]
    [TestCase("", "", 0)]
    [TestCase("a", "", 1)]
    [TestCase("", "a", 1)]
    [TestCase("abc", "abc", 0)]
    [TestCase("abc", "abcde", 2)]
    [TestCase("abcde", "abc", 2)]
    public void CalculateLevenshteinDistance_ReturnsCorrectDistance(string s, string t, int expectedDistance)
    {
        // Act
        int result = StringSimilarityService.CalculateLevenshteinDistance(s, t);

        // Assert
        result.Should().Be(expectedDistance);
    }

    [TestCase("abc", "abc", 1.0)]
    [TestCase("abc", "ABC", 1.0)] // Case-insensitive
    [TestCase("", "", 1.0)]
    [TestCase("abc", "", 0.0)]
    [TestCase(null, "abc", 0.0)]
    [TestCase("abc", "abd", 2.0/3.0)]
    public void CalculateSimilarity_ReturnsCorrectScore(string? s1, string? s2, double expectedScore)
    {
        // Act
        double result = StringSimilarityService.CalculateSimilarity(s1, s2);

        // Assert
        result.Should().BeApproximately(expectedScore, 0.0001);
    }

    [TestCase("test", "test", 0.7, true)]
    [TestCase("test", "tost", 0.7, true)] // 3/4 = 0.75
    [TestCase("test", "toast", 0.7, false)] // 2/5 = 0.4
    [TestCase("", "", 0.7, true)]
    [TestCase("test", "", 0.7, false)]
    public void AreSimilar_ReturnsCorrectResult(string s1, string s2, double threshold, bool expectedResult)
    {
        // Act
        bool result = StringSimilarityService.AreSimilar(s1, s2, threshold);

        // Assert
        result.Should().Be(expectedResult);
    }
}
