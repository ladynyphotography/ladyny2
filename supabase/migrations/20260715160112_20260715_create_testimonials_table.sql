/*
# Create testimonials table

## Purpose
Stores client testimonials displayed on the public landing page. Supports a visitor-submitted
review flow (pending admin approval) and direct admin creation.

## New Table: testimonials
- `id` (uuid, primary key) — unique row identifier
- `name` (text, not null) — client name
- `role` (text, not null) — client title / role
- `quote` (text, not null) — testimonial body
- `image_url` (text, nullable) — optional headshot URL
- `stars` (integer, not null, 1–5) — star rating
- `event` (text, not null) — session type tag (e.g. Events, Portrait, Wedding)
- `display_order` (integer, not null, default 0) — controls sort order in the public grid
- `approved` (boolean, not null, default false) — false = pending review; true = visible publicly
- `created_at` (timestamptz) — record creation timestamp

## Security (RLS)
RLS is enabled. Four separate policies:
1. anon + authenticated SELECT — only approved rows visible publicly (approved = true)
2. anon + authenticated INSERT — anyone can submit a review (lands as approved = false)
3. authenticated UPDATE — admin can update any row (edit, approve/unapprove)
4. authenticated DELETE — admin can delete any row

## Seeded Data
The 3 testimonials previously hardcoded in TestimonialsSection.tsx are inserted with
approved = true so the public page shows identical content immediately after the component
switches to live data.
*/

CREATE TABLE IF NOT EXISTS testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL,
  quote text NOT NULL,
  image_url text,
  stars integer NOT NULL DEFAULT 5 CHECK (stars >= 1 AND stars <= 5),
  event text NOT NULL DEFAULT '',
  display_order integer NOT NULL DEFAULT 0,
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can only see approved testimonials
DROP POLICY IF EXISTS "public_select_approved_testimonials" ON testimonials;
CREATE POLICY "public_select_approved_testimonials" ON testimonials
  FOR SELECT TO anon, authenticated
  USING (approved = true);

-- Anyone can submit a review (stored as pending)
DROP POLICY IF EXISTS "anon_insert_testimonials" ON testimonials;
CREATE POLICY "anon_insert_testimonials" ON testimonials
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- Admin can update any row (approve, edit, reorder)
DROP POLICY IF EXISTS "admin_update_testimonials" ON testimonials;
CREATE POLICY "admin_update_testimonials" ON testimonials
  FOR UPDATE TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin can delete any row
DROP POLICY IF EXISTS "admin_delete_testimonials" ON testimonials;
CREATE POLICY "admin_delete_testimonials" ON testimonials
  FOR DELETE TO authenticated
  USING (true);

-- Admin needs to read all rows (including pending) — separate policy scoped to authenticated
DROP POLICY IF EXISTS "admin_select_all_testimonials" ON testimonials;
CREATE POLICY "admin_select_all_testimonials" ON testimonials
  FOR SELECT TO authenticated
  USING (true);

-- Seed the 3 existing hardcoded testimonials
INSERT INTO testimonials (name, role, quote, image_url, stars, event, display_order, approved)
VALUES
  (
    'Gail Marshall',
    'Events',
    'Nykisha Gaines is the creative force behind LadyNy Photography, where passion meets precision and every moment is transformed into timeless art. With a natural eye for detail and a deep love for storytelling through imagery, Nykisha brings a unique, creative touch to every session.  Her work is known for its high-quality finish and ability to capture authentic emotion, ensuring each photo feels both personal and unforgettable. Clients appreciate not only her artistic vision but also her professionalism and efficiency—delivering beautifully edited images with a quick turnaround time, often within just 10 days.  Whether she''s behind the lens capturing life''s biggest milestones or the smallest candid moments, Nykisha is committed to excellence, making every experience with LadyNy Photography both seamless and memorable.',
    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTuzExKDpRRN5qkKHnJdPhLzT6nH4x4St-bw&s',
    5,
    'Events',
    1,
    true
  ),
  (
    'Keyshanna K',
    'R&B artist',
    'I had an amazing experience working with Lady Ny Photography, at my recent singing performance. From start to finish, they were incredibly professional, kind, and easy to work with. Their energy made me feel comfortable on stage, which really showed in the photos. What impressed me most was the quick turnaround time I received my images the very next day, and the quality was outstanding. Every shot captured the emotion and essence of my performance perfectly. I highly recommend their services to anyone looking for top-tier photography.',
    'https://i.ytimg.com/vi/X7fbcV_TTD0/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLD3VHVg14tUK4hvKfJnSzhUaOyJ9w',
    5,
    'Portrait',
    2,
    true
  ),
  (
    'Katrice Cornett',
    'CEO/Founder T.H.S.A. Records, LLC',
    'We are beyond grateful for the incredible work of Lady Ny Photography during our T.H.S.A. Records, LLC Spring/Summer Catalog Release Concert! From the moment she arrived, Lady Ny brought such a warm, professional, and welcoming presence that made everyone feel comfortable and celebrated. She did a phenomenal job capturing not just photos, but the true essence, spirit, energy, and heartfelt moments of the entire event. Every image reflects the joy, passion, worship, excellence, and love that filled the room. Her creativity, knowledge, attention to detail, and ability to engage with everyone made the experience even more special. She has a beautiful eye for storytelling through photography, and it truly shows in her work. If you are looking for a photographer who is professional, friendly, creative, and reasonably priced, I highly recommend Lady Ny Photography. We will definitely be working with her again in the future! Thank you, Lady Ny Photography, for helping us preserve memories that we will treasure for years to come.',
    'https://xpkpveufhmmxrzohhkmv.supabase.co/storage/v1/object/public/media/thsa.JPG',
    5,
    'Portrait',
    3,
    true
  )
ON CONFLICT DO NOTHING;
