/*
  # Create Portfolio Images Table

  ## Summary
  Creates the `portfolio_images` table to store gallery images for the portfolio section.
  Images are uploaded to the "portfolio" Supabase storage bucket and managed via the admin dashboard.

  ## New Tables
  - `portfolio_images`
    - `id` (uuid, primary key)
    - `url` (text) - Public URL of the image (from Supabase storage or external)
    - `storage_path` (text) - Path within the storage bucket (for deletion)
    - `alt` (text) - Alt text for accessibility and SEO
    - `category` (text) - Category tag: Portraits, Events, Weddings, Branding
    - `span` (text) - Layout span: 'normal' or 'tall' for masonry layout
    - `display_order` (int) - Controls sort order in the gallery
    - `created_at` (timestamptz)

  ## Security
  - RLS enabled
  - Public SELECT allowed so landing page can display portfolio images
  - Only authenticated users can INSERT, UPDATE, DELETE
*/

CREATE TABLE IF NOT EXISTS portfolio_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL DEFAULT '',
  storage_path text DEFAULT NULL,
  alt text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT 'Events',
  span text NOT NULL DEFAULT 'normal',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE portfolio_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view portfolio images"
  ON portfolio_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert portfolio images"
  ON portfolio_images FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update portfolio images"
  ON portfolio_images FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete portfolio images"
  ON portfolio_images FOR DELETE
  TO authenticated
  USING (true);

INSERT INTO portfolio_images (url, alt, category, span, display_order) VALUES
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_1478.jpg', 'Capture the joy', 'Portraits', 'tall', 1),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2210.jpg', 'Intimate moments', 'Events', 'normal', 2),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_1541.jpg', 'In the zone', 'Events', 'normal', 3),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2350.jpg', 'Radiating emotions', 'Portraits', 'tall', 4),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_1742.jpg', 'Capturing the impact', 'Events', 'normal', 5),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2433.jpg', 'Not a moment lost', 'Events', 'normal', 6),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_1848.jpg', 'Bringing you in', 'Events', 'normal', 7),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2446.jpg', 'Details on top of details', 'Events', 'normal', 8),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_2544.jpg', 'Oh what joy', 'Events', 'normal', 9),
('https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/IMG_4108.jpg', 'Memories you will cherish', 'Events', 'normal', 10);
