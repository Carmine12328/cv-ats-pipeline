---
name: ats-compliance-checker
description: Analyzes data/cv.yaml to ensure it follows ATS (Applicant Tracking System) best practices.
---

# ATS Compliance Checker

When invoked, perform the following checks on `data/cv.yaml`:

1. **Standard Section Names**: Ensure that any customized section names in `labels` use standard ATS-friendly terms (e.g., "Summary", "Experience", "Education", "Skills", "Projects"). Avoid non-standard terms.
2. **Action Verbs**: Check the `highlights` under `experience` and `projects`. They should ideally start with strong past-tense action verbs (e.g., "Developed", "Led", "Optimized", "Architected").
3. **Quantifiable Metrics**: Look for numbers, percentages, and scales in the highlights (e.g., "improved performance by 20%"). If they are lacking, suggest where the user could add quantifiable metrics.
4. **Simple Formatting**: Ensure that the data structure remains simple. Remind the user that no complex graphics, multi-column layouts, or unusual date formats should be used.
5. **Contact Information**: Ensure `email`, `phone`, and at least one professional link (`linkedin` or `github`) are present in `basics`.
6. **Date Formats**: Verify that dates are standard (e.g., "YYYY-MM" or "Month YYYY") and consistent across experience and education entries.

Provide a brief, actionable report detailing any recommendations for improving the CV's ATS parsing compatibility.
