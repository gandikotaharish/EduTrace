
-- ============================================
-- EduTrace Full Database Schema
-- ============================================

-- 1. SUBJECTS TABLE
CREATE TABLE public.subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL DEFAULT 'BookOpen',
  color TEXT NOT NULL DEFAULT 'primary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view subjects"
  ON public.subjects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create subjects"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update subjects"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 2. CONCEPTS TABLE
CREATE TABLE public.concepts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  prerequisite_ids UUID[] DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 1,
  estimated_minutes INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view concepts"
  ON public.concepts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can create concepts"
  ON public.concepts FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update concepts"
  ON public.concepts FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can delete concepts"
  ON public.concepts FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 3. CONCEPT CONTENT TABLE (learning material for each concept)
CREATE TABLE public.concept_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE UNIQUE,
  explanation TEXT NOT NULL,
  image_url TEXT,
  thinking_task_type TEXT NOT NULL DEFAULT 'explain',
  thinking_task_prompt TEXT NOT NULL,
  thinking_task_context TEXT,
  thinking_task_expected_insights TEXT[] DEFAULT '{}',
  reflection_prompts TEXT[] DEFAULT '{}',
  micro_app_prompt TEXT NOT NULL,
  micro_app_context TEXT,
  micro_app_rubric TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.concept_content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view concept content"
  ON public.concept_content FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Teachers can manage concept content"
  ON public.concept_content FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Teachers can update concept content"
  ON public.concept_content FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- 4. LEARNING EVIDENCE TABLE (captured per student attempt)
CREATE TABLE public.learning_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  thinking_answer TEXT NOT NULL DEFAULT '',
  thinking_time_seconds INTEGER NOT NULL DEFAULT 0,
  thinking_attempts INTEGER NOT NULL DEFAULT 1,
  thinking_correctness TEXT NOT NULL DEFAULT 'incorrect',
  confusion_point TEXT NOT NULL DEFAULT '',
  mistake_description TEXT NOT NULL DEFAULT '',
  confidence_score INTEGER NOT NULL DEFAULT 3,
  application_answer TEXT NOT NULL DEFAULT '',
  application_time_seconds INTEGER NOT NULL DEFAULT 0,
  application_correctness TEXT NOT NULL DEFAULT 'incorrect',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.learning_evidence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can insert their own evidence"
  ON public.learning_evidence FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can view their own evidence"
  ON public.learning_evidence FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id 
    OR public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  );

-- 5. CONCEPT MASTERY TABLE (calculated per student per concept)
CREATE TABLE public.concept_mastery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  mastery_score INTEGER NOT NULL DEFAULT 0,
  mastery_level TEXT NOT NULL DEFAULT 'novice',
  evidence_count INTEGER NOT NULL DEFAULT 0,
  trend TEXT NOT NULL DEFAULT 'stable',
  last_updated TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(student_id, concept_id)
);

ALTER TABLE public.concept_mastery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own mastery"
  ON public.concept_mastery FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id 
    OR public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Students can upsert their own mastery"
  ON public.concept_mastery FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Students can update their own mastery"
  ON public.concept_mastery FOR UPDATE
  TO authenticated
  USING (auth.uid() = student_id);

-- 6. GAP INSIGHTS TABLE (detected learning gaps)
CREATE TABLE public.gap_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL,
  concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'low',
  suggested_action TEXT NOT NULL,
  detected_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gap_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own insights"
  ON public.gap_insights FOR SELECT
  TO authenticated
  USING (
    auth.uid() = student_id 
    OR public.has_role(auth.uid(), 'teacher') 
    OR public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "System can insert insights"
  ON public.gap_insights FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = student_id);

CREATE POLICY "System can delete old insights"
  ON public.gap_insights FOR DELETE
  TO authenticated
  USING (auth.uid() = student_id);

-- 7. TRIGGERS FOR updated_at
CREATE TRIGGER update_subjects_updated_at
  BEFORE UPDATE ON public.subjects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concepts_updated_at
  BEFORE UPDATE ON public.concepts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_concept_content_updated_at
  BEFORE UPDATE ON public.concept_content
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 8. SEED DATA: HTML Fundamentals Curriculum
-- ============================================

-- Insert the subject
INSERT INTO public.subjects (id, name, description, icon_name, color) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'HTML Fundamentals', 'Core concepts of HTML structure and semantics', 'Code', 'primary');

-- Insert all 8 concepts
INSERT INTO public.concepts (id, subject_id, name, description, prerequisite_ids, sort_order, estimated_minutes) VALUES
  ('c0000001-0000-0000-0000-000000000001', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'HTML Document Structure', 'Understanding the basic skeleton of an HTML document including DOCTYPE, html, head, and body elements.', '{}', 1, 15),
  ('c0000002-0000-0000-0000-000000000002', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Semantic HTML Elements', 'Using meaningful elements like header, nav, main, article, section, aside, and footer for better accessibility and SEO.', ARRAY['c0000001-0000-0000-0000-000000000001']::UUID[], 2, 20),
  ('c0000003-0000-0000-0000-000000000003', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Forms and Input Elements', 'Creating interactive forms with various input types, labels, validation attributes, and proper form structure.', ARRAY['c0000001-0000-0000-0000-000000000001', 'c0000002-0000-0000-0000-000000000002']::UUID[], 3, 25),
  ('c0000004-0000-0000-0000-000000000004', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Links and Navigation', 'Creating hyperlinks, anchor elements, navigation structures, and understanding relative vs absolute URLs.', ARRAY['c0000001-0000-0000-0000-000000000001']::UUID[], 4, 15),
  ('c0000005-0000-0000-0000-000000000005', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Images and Media', 'Embedding images, video, and audio content with proper attributes for accessibility and responsive design.', ARRAY['c0000001-0000-0000-0000-000000000001']::UUID[], 5, 20),
  ('c0000006-0000-0000-0000-000000000006', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Tables for Data', 'Displaying tabular data with proper semantics using table, thead, tbody, tr, th, and td elements.', ARRAY['c0000002-0000-0000-0000-000000000002']::UUID[], 6, 20),
  ('c0000007-0000-0000-0000-000000000007', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Accessibility Fundamentals', 'Making HTML accessible to all users with ARIA attributes, alt text, keyboard navigation, and semantic structure.', ARRAY['c0000002-0000-0000-0000-000000000002', 'c0000003-0000-0000-0000-000000000003', 'c0000005-0000-0000-0000-000000000005']::UUID[], 7, 25),
  ('c0000008-0000-0000-0000-000000000008', 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Meta Tags and SEO', 'Optimizing HTML for search engines with meta tags, Open Graph protocol, structured data, and best practices.', ARRAY['c0000001-0000-0000-0000-000000000001']::UUID[], 8, 15);

-- Insert concept content for ALL 8 concepts
INSERT INTO public.concept_content (concept_id, explanation, thinking_task_type, thinking_task_prompt, thinking_task_context, thinking_task_expected_insights, reflection_prompts, micro_app_prompt, micro_app_rubric) VALUES

-- 1. HTML Document Structure
('c0000001-0000-0000-0000-000000000001',
'Every HTML document follows a specific structure that browsers rely on to render pages correctly.

The **<!DOCTYPE html>** declaration tells the browser this is an HTML5 document. Without it, browsers may render pages in "quirks mode," causing unpredictable behavior.

The **<html>** element wraps everything and is the root of the document. It should include a `lang` attribute for accessibility.

The **<head>** section contains metadata — information about the page that users don''t see directly. This includes the page title (shown in browser tabs), character encoding declaration, and links to stylesheets or scripts.

The **<body>** contains all the visible content — text, images, links, and everything users interact with.

A critical rule: the `<head>` must come before the `<body>`, and the `<title>` must be inside the `<head>`. Getting this wrong causes parsing errors.',
'fix',
'The following HTML has structural errors. Identify ALL problems and explain why each one matters for browser rendering:',
'<!DOCTYPE>
<html>
<title>My Page</title>
<body>
<head>
  <meta charset="UTF-8">
</head>
  <h1>Welcome</h1>
</body>
</html>',
ARRAY['DOCTYPE is incomplete — should be <!DOCTYPE html> for HTML5 standards mode', 'The <head> and <body> are in the wrong order — head must come before body for proper metadata loading', 'The <title> is outside the <head> — it should be nested inside <head> for the browser to display it in the tab', 'Missing lang attribute on <html> — important for screen readers and SEO', 'Structure order matters because browsers parse top-to-bottom and expect metadata before content'],
ARRAY['What part of HTML document structure confused you the most?', 'Did you catch all the errors on your first attempt, or did you miss any?', 'How confident are you about identifying structural errors in real code?'],
'Write the minimal valid HTML5 document structure with a title "My First Page" and a single paragraph saying "Hello World". Include proper DOCTYPE, character encoding, and language attribute.',
ARRAY['Includes correct <!DOCTYPE html> declaration', 'Has <html> element with lang attribute', 'Contains <head> with <meta charset="UTF-8"> and <title>', 'Body contains a <p> element with the correct text', 'Elements are properly nested and ordered']),

-- 2. Semantic HTML Elements
('c0000002-0000-0000-0000-000000000002',
'Semantic HTML uses elements that clearly describe their meaning and purpose, both to the browser and to developers reading the code.

Instead of generic **<div>** containers everywhere, HTML5 provides elements with built-in meaning:
- **<header>** — Introductory content or navigation aids
- **<nav>** — Navigation links
- **<main>** — The primary content area (only one per page)
- **<article>** — Self-contained content that could be distributed independently
- **<section>** — Thematic grouping of content
- **<aside>** — Content tangentially related to the main content
- **<footer>** — Footer information

**Why does this matter?**
1. **Screen readers** use these elements to help visually impaired users navigate. A `<nav>` is announced as navigation; a `<div class="nav">` is just a generic container.
2. **SEO** — Search engines understand page structure better with semantic elements.
3. **Code readability** — Any developer can instantly understand the page layout.

A common mistake is using `<section>` when `<div>` would suffice. Use `<section>` only when the content has a natural heading.',
'compare',
'Compare these two approaches to building a blog page layout. Which is better and why? Consider accessibility, SEO, and maintainability.',
'Option A:
<div class="header">
  <div class="logo">BlogSite</div>
  <div class="nav">
    <div class="nav-item">Home</div>
    <div class="nav-item">About</div>
  </div>
</div>
<div class="content">
  <div class="post">
    <div class="post-title">My Article</div>
    <div class="post-body">Content here...</div>
  </div>
</div>
<div class="footer">Copyright 2024</div>

Option B:
<header>
  <h1>BlogSite</h1>
  <nav>
    <a href="/">Home</a>
    <a href="/about">About</a>
  </nav>
</header>
<main>
  <article>
    <h2>My Article</h2>
    <p>Content here...</p>
  </article>
</main>
<footer><p>Copyright 2024</p></footer>',
ARRAY['Option B uses semantic elements that convey meaning to browsers and assistive tech', 'Screen readers can navigate by landmarks (header, nav, main) in Option B', 'Option B uses proper heading hierarchy (h1, h2) for document outline', 'Navigation items should be actual <a> elements, not divs — clickable by default', 'Option B is more maintainable because the structure is self-documenting'],
ARRAY['Which semantic element was completely new to you?', 'Did you initially think both options were equally valid?', 'How confident are you about choosing between <section>, <article>, and <div>?'],
'Convert this div-based layout to use proper semantic HTML: A page with a company logo at the top, a navigation menu with 3 links (Home, Services, Contact), a main content area containing a blog article with a title and 2 paragraphs, a sidebar with related links, and a footer with copyright text.',
ARRAY['Uses <header> for the top section with logo', 'Uses <nav> with <a> elements for navigation', 'Uses <main> for primary content area', 'Uses <article> for the blog post with proper heading', 'Uses <aside> for the sidebar', 'Uses <footer> for the bottom section']),

-- 3. Forms and Input Elements
('c0000003-0000-0000-0000-000000000003',
'HTML forms are the primary way users send data to a server. A well-structured form is crucial for usability, accessibility, and data integrity.

**Form Structure:**
```html
<form action="/submit" method="POST">
  <label for="email">Email:</label>
  <input type="email" id="email" name="email" required>
  <button type="submit">Send</button>
</form>
```

**Key Concepts:**
- Every `<input>` needs a `name` attribute — this is the key sent to the server
- `<label>` elements must be associated with inputs via the `for` attribute matching the input''s `id`
- The `type` attribute determines validation and keyboard behavior on mobile
- Common types: `text`, `email`, `password`, `number`, `tel`, `url`, `date`, `checkbox`, `radio`

**Validation Attributes:**
- `required` — Field must be filled
- `minlength` / `maxlength` — Text length constraints
- `min` / `max` — Number range constraints
- `pattern` — Custom regex validation

**Accessibility:**
- Always use `<label>` — clicking the label focuses the input
- Group related inputs with `<fieldset>` and `<legend>`
- Use `aria-describedby` for additional instructions',
'fix',
'This registration form has several usability, accessibility, and functional problems. Find and explain each issue:',
'<form>
  <div>Name: <input type="text"></div>
  <div>Email: <input></div>
  <div>Age: <input type="text"></div>
  <div>Password: <input type="text"></div>
  <div>
    <input type="checkbox"> I agree to terms
  </div>
  <div><input type="submit"></div>
</form>',
ARRAY['Missing <label> elements — clicking text does not focus the inputs', 'No name attributes on any input — data cannot be submitted', 'Email input has no type="email" — no validation or mobile keyboard', 'Age should use type="number" with min/max constraints', 'Password should use type="password" to hide characters', 'No required attributes for mandatory fields', 'Checkbox label is not associated with the input', 'Form has no action or method attributes'],
ARRAY['Which form validation attribute did you not know about before?', 'Have you ever submitted a form that had these kinds of issues?', 'How confident are you in building accessible forms from scratch?'],
'Build a complete contact form with: Full Name (required, min 2 chars), Email (required, valid email), Phone (optional), Message (required, min 10 chars, max 500 chars), and a "Send Message" submit button. Include proper labels, input types, and validation attributes.',
ARRAY['All inputs have associated <label> elements with for/id pairing', 'Inputs have appropriate type attributes (text, email, tel, textarea)', 'Required fields have the required attribute', 'Text constraints use minlength/maxlength', 'Form has action and method attributes', 'Submit button uses proper button or input element']),

-- 4. Links and Navigation
('c0000004-0000-0000-0000-000000000004',
'Links are the backbone of the web — they connect pages and resources together. Understanding how to create effective navigation is essential.

**The Anchor Element:**
```html
<a href="https://example.com">Visit Example</a>
```

**URL Types:**
- **Absolute:** `https://example.com/page` — Full URL including protocol
- **Relative:** `./about.html` or `/about` — Relative to current location
- **Fragment:** `#section-id` — Links to an element on the same page
- **Email:** `mailto:user@example.com` — Opens email client
- **Phone:** `tel:+1234567890` — Opens phone dialer on mobile

**Important Attributes:**
- `target="_blank"` — Opens in new tab (always add `rel="noopener noreferrer"` for security)
- `title` — Tooltip text on hover
- `download` — Triggers file download instead of navigation

**Navigation Best Practices:**
- Wrap navigation links in `<nav>` element
- Use descriptive link text (never "click here")
- Make the current page link visually distinct
- Ensure links are keyboard-focusable and have visible focus states',
'predict',
'Before looking at the answer, predict what will happen when a user clicks each of these links. Consider both desktop and mobile behavior:',
'<nav>
  <a href="/">Home</a>
  <a href="#pricing">Pricing</a>
  <a href="https://docs.example.com" target="_blank">Docs</a>
  <a href="mailto:help@example.com">Email Us</a>
  <a href="tel:+18005551234">Call Us</a>
  <a href="/report.pdf" download>Download Report</a>
  <a href="javascript:void(0)">Do Nothing</a>
</nav>',
ARRAY['/ navigates to the root/homepage of the current site', '#pricing scrolls to the element with id="pricing" on the current page', 'target="_blank" opens docs in a new tab — needs rel="noopener noreferrer" for security', 'mailto: opens the default email client with the address pre-filled', 'tel: on mobile opens the phone dialer; on desktop may open a calling app', 'download attribute triggers a file download instead of navigating', 'javascript:void(0) is an anti-pattern — should use a <button> instead'],
ARRAY['Did any link behavior surprise you?', 'Were you aware of the security risk with target="_blank"?', 'How confident are you about choosing between relative and absolute URLs?'],
'Create a complete website navigation for a restaurant: Logo linked to homepage, menu items (Menu, Reservations, About, Contact), a phone number link, and social media links that open in new tabs. Use proper semantic HTML and include all necessary attributes.',
ARRAY['Uses <nav> element for navigation structure', 'Logo links to "/" using relative URL', 'Internal links use relative URLs', 'Phone uses tel: protocol', 'External links use target="_blank" with rel="noopener noreferrer"', 'Link text is descriptive and meaningful']),

-- 5. Images and Media
('c0000005-0000-0000-0000-000000000005',
'Images and media make web content engaging, but they must be implemented correctly for accessibility, performance, and responsive design.

**The Image Element:**
```html
<img src="photo.jpg" alt="A sunset over the ocean" width="800" height="600">
```

**Critical Attributes:**
- `alt` — Alternative text for screen readers and when images fail to load. Decorative images use `alt=""`
- `width` and `height` — Prevents layout shift while the image loads
- `loading="lazy"` — Delays loading until the image is near the viewport

**Responsive Images:**
```html
<picture>
  <source media="(min-width: 800px)" srcset="large.jpg">
  <source media="(min-width: 400px)" srcset="medium.jpg">
  <img src="small.jpg" alt="Responsive image example">
</picture>
```

**Video and Audio:**
```html
<video controls width="640">
  <source src="video.mp4" type="video/mp4">
  Your browser does not support video.
</video>
```

**Figure Element:**
Use `<figure>` and `<figcaption>` to associate images with captions:
```html
<figure>
  <img src="chart.png" alt="Sales growth chart showing 40% increase">
  <figcaption>Figure 1: Q4 sales growth</figcaption>
</figure>
```',
'explain',
'Explain why each image in this gallery has accessibility problems. What would a screen reader user experience?',
'<div class="gallery">
  <img src="sunset.jpg">
  <img src="team-photo.jpg" alt="image">
  <img src="decorative-border.png" alt="A beautiful decorative border pattern with floral motifs in gold and green">
  <img src="graph.png" alt="graph">
  <img src="hero-bg.jpg" alt="background">
</div>',
ARRAY['First image has no alt attribute — screen reader announces the filename which is meaningless', 'Second image alt="image" is useless — should describe who is in the team photo', 'Third image is decorative and should use alt="" — the long description wastes screen reader time', 'Fourth image alt="graph" does not describe the data — should say what the graph shows', 'Fifth image is a background — should either use CSS background-image or alt=""'],
ARRAY['Did you know that decorative images should have empty alt text?', 'Have you ever used a website with a screen reader?', 'How confident are you in writing good alt text for complex images?'],
'Create an image gallery for a photography portfolio with 3 images: a landscape photo with descriptive alt text, a portrait photo using the figure/figcaption pattern, and a decorative divider image. Include proper loading strategies and responsive image techniques.',
ARRAY['All images have appropriate alt attributes', 'Decorative image uses alt=""', 'At least one image uses <figure> and <figcaption>', 'Images include width and height to prevent layout shift', 'Uses loading="lazy" for below-the-fold images', 'Includes responsive image technique (srcset or picture)']),

-- 6. Tables for Data
('c0000006-0000-0000-0000-000000000006',
'HTML tables are designed for displaying **tabular data** — information that naturally fits into rows and columns. They should never be used for page layout.

**Table Structure:**
```html
<table>
  <caption>Monthly Sales Report</caption>
  <thead>
    <tr>
      <th scope="col">Month</th>
      <th scope="col">Revenue</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>January</td>
      <td>$45,000</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <td>Total</td>
      <td>$540,000</td>
    </tr>
  </tfoot>
</table>
```

**Key Elements:**
- `<caption>` — Describes the table content for accessibility
- `<thead>` — Groups header rows
- `<tbody>` — Groups body rows
- `<tfoot>` — Groups footer rows (totals, summaries)
- `<th>` — Header cells (bold and centered by default)
- `<td>` — Data cells
- `scope="col"` or `scope="row"` — Tells screen readers how headers relate to data

**Common Mistakes:**
- Using tables for layout (use CSS Grid or Flexbox instead)
- Missing `<thead>` and `<tbody>` — browsers add `<tbody>` implicitly which can cause CSS issues
- Not using `<th>` for headers — screen readers can''t identify column/row labels',
'fix',
'This table has semantic and accessibility problems. Identify every issue:',
'<table>
  <tr>
    <td><b>Student</b></td>
    <td><b>Math</b></td>
    <td><b>Science</b></td>
    <td><b>English</b></td>
  </tr>
  <tr>
    <td>Alice</td>
    <td>92</td>
    <td>88</td>
    <td>95</td>
  </tr>
  <tr>
    <td>Bob</td>
    <td>78</td>
    <td>85</td>
    <td>72</td>
  </tr>
  <tr>
    <td>Average</td>
    <td>85</td>
    <td>86.5</td>
    <td>83.5</td>
  </tr>
</table>',
ARRAY['Header row uses <td> with <b> instead of <th> — screen readers cannot identify headers', 'Missing <thead>, <tbody>, <tfoot> grouping — no semantic structure', 'No <caption> element — users cannot understand the table purpose', 'Headers need scope="col" for the subject columns and scope="row" for student names', 'Average row should be in <tfoot> as it is a summary', 'Using <b> for visual emphasis instead of semantic <th> is an accessibility failure'],
ARRAY['Were you aware of the scope attribute on table headers?', 'Have you ever used <tfoot> in a table before?', 'How confident are you in building accessible data tables?'],
'Create a properly structured HTML table showing a class schedule with: days of the week as columns, time slots (9AM, 10AM, 11AM, 12PM) as rows, subject names in cells, a caption, and a footer row showing the total classes per day. Use all proper semantic table elements.',
ARRAY['Uses <caption> to describe the table', 'Uses <thead> with <th scope="col"> for day headers', 'Uses <tbody> for schedule data', 'Uses <tfoot> for the totals row', 'Row headers use <th scope="row"> for time slots', 'Proper nesting of <tr>, <th>, and <td>']),

-- 7. Accessibility Fundamentals
('c0000007-0000-0000-0000-000000000007',
'Web accessibility (a11y) ensures that websites are usable by everyone, including people with disabilities. It''s not optional — it''s both a legal requirement and an ethical responsibility.

**The Four Principles (WCAG POUR):**
1. **Perceivable** — Content must be presentable in ways all users can perceive (alt text, captions, contrast)
2. **Operable** — Interface must be navigable by keyboard, touch, and assistive tech
3. **Understandable** — Content and UI must be clear and predictable
4. **Robust** — Content must work with current and future technologies

**Essential Techniques:**
- **Alt text** on all meaningful images
- **Heading hierarchy** (h1 → h2 → h3, never skip levels)
- **Color contrast** — At least 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation** — All interactive elements must be focusable and operable
- **Focus indicators** — Never remove outline on focus without providing an alternative
- **Form labels** — Every input needs an associated label

**ARIA (Accessible Rich Internet Applications):**
- `aria-label` — Provides a label when visible text isn''t available
- `aria-describedby` — Links to an element providing additional description
- `aria-hidden="true"` — Hides decorative elements from screen readers
- `role` — Defines the purpose of an element (use sparingly — prefer semantic HTML)

**The First Rule of ARIA:** Don''t use ARIA if there''s a native HTML element that does the job.',
'compare',
'Compare these two implementations of a navigation menu with a dropdown. Which is more accessible and why?',
'Option A:
<div class="nav">
  <div class="menu-item" onclick="toggleMenu()">
    Products ▼
  </div>
  <div class="dropdown" style="display:none" id="menu1">
    <div onclick="goTo(''/laptops'')">Laptops</div>
    <div onclick="goTo(''/phones'')">Phones</div>
  </div>
</div>

Option B:
<nav aria-label="Main navigation">
  <button aria-expanded="false" aria-controls="menu1" onclick="toggleMenu()">
    Products
    <span aria-hidden="true">▼</span>
  </button>
  <ul id="menu1" role="menu" hidden>
    <li role="menuitem"><a href="/laptops">Laptops</a></li>
    <li role="menuitem"><a href="/phones">Phones</a></li>
  </ul>
</nav>',
ARRAY['Option B uses <nav> with aria-label for landmark navigation', 'Button element is keyboard-focusable by default; div requires tabindex', 'aria-expanded communicates open/closed state to screen readers', 'aria-controls associates the button with its dropdown content', 'Using <a> links instead of div onclick allows keyboard navigation and right-click', 'aria-hidden on the arrow prevents screen readers from announcing decorative text', 'role="menu" and role="menuitem" provide proper ARIA semantics'],
ARRAY['Were you aware of the aria-expanded attribute for dropdowns?', 'What surprised you most about accessibility requirements?', 'How confident are you in making a form fully keyboard-navigable?'],
'Make this inaccessible HTML card component accessible. Add: proper heading level, alt text for the image, keyboard-focusable link, proper button with aria-label, and ensure all interactive elements work without a mouse. Original: <div class="card"><img src="product.jpg"><div class="title">Wireless Headphones</div><div class="price">$79.99</div><div class="btn" onclick="addToCart()">Add to Cart</div></div>',
ARRAY['Image has descriptive alt text', 'Title uses a proper heading element (h2 or h3)', 'Add to Cart uses a <button> element, not a div', 'Button has aria-label if the visible text is not sufficient', 'Card link wraps the title or uses proper anchor element', 'All interactive elements are keyboard focusable and operable']),

-- 8. Meta Tags and SEO
('c0000008-0000-0000-0000-000000000008',
'Meta tags live in the `<head>` section and provide information about the page to browsers, search engines, and social media platforms.

**Essential Meta Tags:**
```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Learn HTML fundamentals with interactive exercises">
  <title>HTML Basics | EduTrace</title>
</head>
```

**The Viewport Meta Tag** is critical for responsive design — without it, mobile browsers render the page at desktop width and zoom out.

**SEO Meta Tags:**
- `<title>` — Most important for SEO. Keep under 60 characters. Include primary keyword.
- `<meta name="description">` — Shows in search results. Keep under 160 characters.
- `<link rel="canonical">` — Prevents duplicate content issues

**Open Graph (Social Media):**
```html
<meta property="og:title" content="Learn HTML">
<meta property="og:description" content="Interactive HTML course">
<meta property="og:image" content="https://example.com/preview.jpg">
<meta property="og:type" content="website">
```

**Structured Data:**
JSON-LD helps search engines understand your content:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "HTML Fundamentals",
  "description": "Learn core HTML concepts"
}
</script>
```

**Common Mistakes:**
- Missing viewport meta tag (page looks broken on mobile)
- Title too long (gets truncated in search results)
- Same title/description on every page (hurts SEO)',
'predict',
'Look at this <head> section and predict how the page will appear in: 1) Google search results, 2) When shared on Twitter/LinkedIn, 3) On a mobile phone.',
'<head>
  <meta charset="UTF-8">
  <title>Best Chocolate Chip Cookie Recipe - HomeChef Kitchen - The Ultimate Guide to Baking Perfect Cookies Every Time at Home</title>
  <meta name="description" content="cookies recipe">
  <meta property="og:title" content="Cookie Recipe">
  <meta property="og:description" content="A great recipe">
</head>',
ARRAY['Title is too long (80+ chars) — Google will truncate it around 60 characters', 'Description "cookies recipe" is too short — Google may auto-generate a snippet instead', 'Missing viewport meta tag — page will display at desktop width on mobile, requiring zoom', 'OG title is generic — social shares will look unengaging', 'OG description lacks detail — no one will click through from social media', 'Missing og:image — social shares will have no preview image, dramatically reducing engagement', 'Missing og:type — defaults to "website" which may not be optimal for a recipe'],
ARRAY['Did you know that Google truncates titles beyond 60 characters?', 'Have you ever noticed how your shared links appear on social media?', 'How confident are you in writing meta tags that improve SEO and social sharing?'],
'Write the complete <head> section for a recipe page titled "Easy Banana Bread" on a cooking website. Include: charset, viewport, SEO-optimized title (under 60 chars), compelling meta description (under 160 chars), canonical URL, Open Graph tags for social sharing (title, description, image, type), and JSON-LD structured data for the recipe.',
ARRAY['Includes charset and viewport meta tags', 'Title is under 60 characters with primary keyword', 'Meta description is under 160 characters and compelling', 'Has canonical link tag', 'Complete Open Graph tags including og:image', 'JSON-LD structured data with @type Recipe', 'All content is specific and production-ready, not placeholder text']);

-- 9. FUNCTION: Calculate mastery from evidence
CREATE OR REPLACE FUNCTION public.calculate_mastery(
  p_student_id UUID,
  p_concept_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_evidence_count INTEGER;
  v_latest_score INTEGER;
  v_prev_score INTEGER;
  v_avg_thinking NUMERIC;
  v_avg_application NUMERIC;
  v_avg_confidence NUMERIC;
  v_correctness_score NUMERIC;
  v_mastery_score INTEGER;
  v_mastery_level TEXT;
  v_trend TEXT;
BEGIN
  -- Count evidence
  SELECT COUNT(*) INTO v_evidence_count
  FROM public.learning_evidence
  WHERE student_id = p_student_id AND concept_id = p_concept_id;

  IF v_evidence_count = 0 THEN
    RETURN;
  END IF;

  -- Calculate average scores from all evidence
  SELECT
    AVG(CASE thinking_correctness WHEN 'correct' THEN 100 WHEN 'partial' THEN 60 ELSE 20 END),
    AVG(CASE application_correctness WHEN 'correct' THEN 100 WHEN 'partial' THEN 60 ELSE 20 END),
    AVG(confidence_score * 20)
  INTO v_avg_thinking, v_avg_application, v_avg_confidence
  FROM public.learning_evidence
  WHERE student_id = p_student_id AND concept_id = p_concept_id;

  -- Calculate correctness component (thinking 40% + application 40% + confidence alignment 20%)
  v_correctness_score := (v_avg_thinking * 0.4) + (v_avg_application * 0.4) + (v_avg_confidence * 0.2);

  -- Bonus for multiple attempts (learning shows growth)
  IF v_evidence_count >= 3 THEN
    v_correctness_score := LEAST(v_correctness_score + 5, 100);
  END IF;

  v_mastery_score := ROUND(v_correctness_score)::INTEGER;
  v_mastery_score := GREATEST(0, LEAST(100, v_mastery_score));

  -- Determine level
  v_mastery_level := CASE
    WHEN v_mastery_score >= 90 THEN 'expert'
    WHEN v_mastery_score >= 75 THEN 'proficient'
    WHEN v_mastery_score >= 55 THEN 'developing'
    WHEN v_mastery_score >= 35 THEN 'emerging'
    ELSE 'novice'
  END;

  -- Determine trend (compare latest vs previous)
  SELECT mastery_score INTO v_prev_score
  FROM public.concept_mastery
  WHERE student_id = p_student_id AND concept_id = p_concept_id;

  IF v_prev_score IS NULL THEN
    v_trend := 'stable';
  ELSIF v_mastery_score > v_prev_score + 5 THEN
    v_trend := 'improving';
  ELSIF v_mastery_score < v_prev_score - 5 THEN
    v_trend := 'declining';
  ELSE
    v_trend := 'stable';
  END IF;

  -- Upsert mastery
  INSERT INTO public.concept_mastery (student_id, concept_id, mastery_score, mastery_level, evidence_count, trend, last_updated)
  VALUES (p_student_id, p_concept_id, v_mastery_score, v_mastery_level, v_evidence_count, v_trend, now())
  ON CONFLICT (student_id, concept_id)
  DO UPDATE SET
    mastery_score = EXCLUDED.mastery_score,
    mastery_level = EXCLUDED.mastery_level,
    evidence_count = EXCLUDED.evidence_count,
    trend = EXCLUDED.trend,
    last_updated = now();
END;
$$;

-- 10. FUNCTION: Detect gap insights after evidence submission
CREATE OR REPLACE FUNCTION public.detect_gap_insights(
  p_student_id UUID,
  p_concept_id UUID
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_latest learning_evidence%ROWTYPE;
  v_mastery concept_mastery%ROWTYPE;
  v_concept concepts%ROWTYPE;
BEGIN
  -- Get latest evidence
  SELECT * INTO v_latest
  FROM public.learning_evidence
  WHERE student_id = p_student_id AND concept_id = p_concept_id
  ORDER BY created_at DESC LIMIT 1;

  -- Get mastery
  SELECT * INTO v_mastery
  FROM public.concept_mastery
  WHERE student_id = p_student_id AND concept_id = p_concept_id;

  -- Get concept
  SELECT * INTO v_concept
  FROM public.concepts WHERE id = p_concept_id;

  -- Clear old insights for this student+concept
  DELETE FROM public.gap_insights
  WHERE student_id = p_student_id AND concept_id = p_concept_id;

  -- Detect False Confidence: high confidence but wrong answers
  IF v_latest.confidence_score >= 4 AND (v_latest.thinking_correctness = 'incorrect' OR v_latest.application_correctness = 'incorrect') THEN
    INSERT INTO public.gap_insights (student_id, concept_id, type, description, severity, suggested_action)
    VALUES (p_student_id, p_concept_id, 'false_confidence',
      'High confidence (' || v_latest.confidence_score || '/5) but incorrect answers on ' || v_concept.name,
      'high',
      'Provide feedback that challenges assumptions about ' || v_concept.name || '. Focus on why the answer was wrong.');
  END IF;

  -- Detect Fragile Understanding: correct but low confidence
  IF v_latest.confidence_score <= 2 AND v_latest.thinking_correctness = 'correct' AND v_latest.application_correctness = 'correct' THEN
    INSERT INTO public.gap_insights (student_id, concept_id, type, description, severity, suggested_action)
    VALUES (p_student_id, p_concept_id, 'fragile_understanding',
      'Correct answers but low confidence (' || v_latest.confidence_score || '/5) — understanding may not be solid for ' || v_concept.name,
      'low',
      'Additional practice to build confidence in ' || v_concept.name);
  END IF;

  -- Detect Misconception: repeated incorrect thinking
  IF v_latest.thinking_correctness = 'incorrect' AND v_mastery.evidence_count >= 2 THEN
    INSERT INTO public.gap_insights (student_id, concept_id, type, description, severity, suggested_action)
    VALUES (p_student_id, p_concept_id, 'misconception',
      'Repeated incorrect reasoning on ' || v_concept.name || ' across multiple attempts',
      'medium',
      'Targeted re-teaching with different examples for ' || v_concept.name);
  END IF;

  -- Detect Missing Prerequisite: struggling with a concept that has prerequisites
  IF v_mastery.mastery_score < 40 AND array_length(v_concept.prerequisite_ids, 1) > 0 THEN
    INSERT INTO public.gap_insights (student_id, concept_id, type, description, severity, suggested_action)
    VALUES (p_student_id, p_concept_id, 'missing_prerequisite',
      'Struggling with ' || v_concept.name || ' — may need to review prerequisite concepts first',
      'high',
      'Review prerequisite concepts before continuing with ' || v_concept.name);
  END IF;
END;
$$;

-- 11. TRIGGER: Auto-calculate mastery and detect gaps when evidence is inserted
CREATE OR REPLACE FUNCTION public.on_evidence_inserted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.calculate_mastery(NEW.student_id, NEW.concept_id);
  PERFORM public.detect_gap_insights(NEW.student_id, NEW.concept_id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_evidence_inserted
  AFTER INSERT ON public.learning_evidence
  FOR EACH ROW
  EXECUTE FUNCTION public.on_evidence_inserted();
