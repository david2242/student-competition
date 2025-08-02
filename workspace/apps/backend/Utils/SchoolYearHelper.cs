using System;

namespace Workspace.Backend.Utils
{
    public static class SchoolYearHelper
    {
        /// <summary>
        /// Calculates the school year based on a given date.
        /// </summary>
        /// <param name="date">The date to calculate the school year for</param>
        /// <returns>The school year (e.g., 2024 for the 2024-2025 school year)</returns>
        public static int GetSchoolYear(DateTime date)
        {
            // If the month is September or later, the school year is the current year
            // If the month is August or earlier, the school year is the previous year
            return date.Month >= 9 ? date.Year : date.Year - 1;
        }
    }
}
