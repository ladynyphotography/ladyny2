/*
# Fix testimonials SELECT policies

## Problem
The original migration created two overlapping SELECT policies that both matched the
`authenticated` role, which caused unpredictable behaviour for the anon key used by
the public landing page — returning no rows even though approved testimonials exist.

## Changes
- Drop the two conflicting SELECT policies.
- Recreate them as clean, non-overlapping policies:
  - `anon` only: sees rows where approved = true (public page)
  - `authenticated` only: sees all rows (admin dashboard)

No table structure or data is changed. All other policies (INSERT, UPDATE, DELETE) are untouched.
*/

DROP POLICY IF EXISTS "public_select_approved_testimonials" ON testimonials;
DROP POLICY IF EXISTS "admin_select_all_testimonials" ON testimonials;

CREATE POLICY "anon_select_approved_testimonials" ON testimonials
  FOR SELECT TO anon
  USING (approved = true);

CREATE POLICY "authenticated_select_all_testimonials" ON testimonials
  FOR SELECT TO authenticated
  USING (true);
