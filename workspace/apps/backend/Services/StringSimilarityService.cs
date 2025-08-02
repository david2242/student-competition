using System;
using System.Linq;

namespace Workspace.Backend.Services
{
    public static class StringSimilarityService
    {
        /// <summary>
        /// Calculates the Levenshtein distance between two strings.
        /// The lower the distance, the more similar the strings are.
        /// </summary>
        public static int CalculateLevenshteinDistance(string s, string t)
        {
            if (string.IsNullOrEmpty(s))
            {
                return string.IsNullOrEmpty(t) ? 0 : t.Length;
            }

            if (string.IsNullOrEmpty(t))
            {
                return s.Length;
            }

            int n = s.Length;
            int m = t.Length;
            int[,] d = new int[n + 1, m + 1];

            // Initialize the first row and column
            for (int i = 0; i <= n; d[i, 0] = i++) { }
            for (int j = 0; j <= m; d[0, j] = j++) { }

            for (int i = 1; i <= n; i++)
            {
                for (int j = 1; j <= m; j++)
                {
                    int cost = (t[j - 1] == s[i - 1]) ? 0 : 1;
                    d[i, j] = Math.Min(
                        Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1),
                        d[i - 1, j - 1] + cost);
                }
            }

            return d[n, m];
        }


        /// <summary>
        /// Calculates a similarity score between two strings (0.0 to 1.0).
        /// 1.0 means the strings are identical, 0.0 means completely different.
        /// </summary>
        public static double CalculateSimilarity(string s1, string s2)
        {
            if (s1 == null || s2 == null) return 0.0;
            if (s1 == s2) return 1.0;

            // Convert to lowercase for case-insensitive comparison
            s1 = s1.ToLowerInvariant();
            s2 = s2.ToLowerInvariant();

            int maxLen = Math.Max(s1.Length, s2.Length);
            if (maxLen == 0) return 1.0;

            int distance = CalculateLevenshteinDistance(s1, s2);
            return 1.0 - (double)distance / maxLen;
        }

        /// <summary>
        /// Checks if two strings are similar based on a threshold.
        /// </summary>
        /// <param name="s1">First string</param>
        /// <param name="s2">Second string</param>
        /// <param name="threshold">Similarity threshold (0.0 to 1.0). Default is 0.7 (70% similar)</param>
        public static bool AreSimilar(string s1, string s2, double threshold = 0.7)
        {
            if (string.IsNullOrEmpty(s1) && string.IsNullOrEmpty(s2)) return true;
            if (string.IsNullOrEmpty(s1) || string.IsNullOrEmpty(s2)) return false;
            
            return CalculateSimilarity(s1, s2) >= threshold;
        }
    }
}
