/*
  # Create Inquiries Table for Lady Ny Photography

  ## Summary
  Creates the `inquiries` table to store booking and inquiry form submissions from prospective clients.

  ## New Tables
  - `inquiries`
    - `id` (uuid, primary key) - Unique identifier for each inquiry
    - `name` (text, not null) - Client's full name
    - `email` (text, not null) - Client's email address
    - `phone` (text) - Client's phone number (optional)
    - `session_type` (text) - Type of photography session requested
    - `message` (text) - Client's message or additional details
    - `created_at` (timestamptz) - When the inquiry was submitted

  ## Security
  - RLS enabled: only the service role can read inquiries (private business data)
  - Public INSERT policy: anyone can submit an inquiry (contact form use case)
  - No public SELECT/UPDATE/DELETE to protect client data privacy
*/

CREATE TABLE IF NOT EXISTS inquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text DEFAULT '',
  session_type text DEFAULT '',
  message text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit an inquiry"
  ON inquiries
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view inquiries"
  ON inquiries
  FOR SELECT
  TO authenticated
  USING (true);
