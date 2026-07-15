/*
  # Create Services Table

  ## Summary
  Creates the `services` table to store photography service offerings for the landing page.
  This table powers the Services Section and is managed via the admin dashboard.

  ## New Tables
  - `services`
    - `id` (uuid, primary key)
    - `title` (text) - Service name (e.g., Weddings, Portraits)
    - `description` (text) - Short description of the service
    - `pricing` (text) - Pricing text (e.g., "Starting at $2,500")
    - `image_url` (text) - URL for the service card image
    - `icon` (text) - Icon name string for the frontend to map
    - `tag` (text) - Optional badge label (e.g., "Most Popular")
    - `display_order` (int) - Controls sort order on the page
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public SELECT allowed so landing page can display services
  - Only authenticated users can INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT '',
  description text NOT NULL DEFAULT '',
  pricing text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  icon text NOT NULL DEFAULT 'Camera',
  tag text DEFAULT NULL,
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view services"
  ON services FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update services"
  ON services FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete services"
  ON services FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO services (title, description, pricing, image_url, icon, tag, display_order) VALUES
(
  'Weddings',
  'Your love story deserves to be told in full. From the quiet morning preparations to the final dance, I capture every emotion-filled chapter of your perfect day.',
  'Starting at $2,500',
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop',
  'Heart',
  'Most Popular',
  1
),
(
  'Portraits',
  'A portrait session is an invitation to see yourself as you truly are — powerful, beautiful, and real. Whether individual, family, or maternity, we tell your story.',
  'Starting at $350',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80&auto=format&fit=crop',
  'User',
  NULL,
  2
),
(
  'Branding & Business',
  'Your brand has a story only you can tell. Professional imagery for entrepreneurs, creatives, and businesses ready to show up with confidence and intention.',
  'Custom Packages Available',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&auto=format&fit=crop',
  'Briefcase',
  NULL,
  3
),
(
  'Events',
  'From milestone birthdays to corporate gatherings, I document the energy and connection that make your event unforgettable — so you can stay present in the moment.',
  'Starting at $600',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80&auto=format&fit=crop',
  'Calendar',
  NULL,
  4
);
