import { Concept, ConceptContent, ConceptMastery, GapInsight, User, Subject, LearningEvidence } from '@/types';

// Sample Subject
export const htmlSubject: Subject = {
  id: 'html-basics',
  name: 'HTML Fundamentals',
  description: 'Core concepts of HTML structure and semantics',
  iconName: 'Code',
  color: 'primary',
};

// Sample Concepts
export const concepts: Concept[] = [
  {
    id: 'html-structure',
    subjectId: 'html-basics',
    name: 'HTML Document Structure',
    description: 'Understanding the basic skeleton of an HTML document',
    prerequisiteIds: [],
    order: 1,
    estimatedMinutes: 15,
  },
  {
    id: 'semantic-elements',
    subjectId: 'html-basics',
    name: 'Semantic HTML Elements',
    description: 'Using meaningful elements like header, nav, main, article',
    prerequisiteIds: ['html-structure'],
    order: 2,
    estimatedMinutes: 20,
  },
  {
    id: 'forms-inputs',
    subjectId: 'html-basics',
    name: 'Forms and Input Elements',
    description: 'Creating interactive forms with various input types',
    prerequisiteIds: ['html-structure', 'semantic-elements'],
    order: 3,
    estimatedMinutes: 25,
  },
  {
    id: 'links-navigation',
    subjectId: 'html-basics',
    name: 'Links and Navigation',
    description: 'Creating hyperlinks and navigation structures',
    prerequisiteIds: ['html-structure'],
    order: 4,
    estimatedMinutes: 15,
  },
  {
    id: 'images-media',
    subjectId: 'html-basics',
    name: 'Images and Media',
    description: 'Embedding images, video, and audio content',
    prerequisiteIds: ['html-structure'],
    order: 5,
    estimatedMinutes: 20,
  },
  {
    id: 'tables-data',
    subjectId: 'html-basics',
    name: 'Tables for Data',
    description: 'Displaying tabular data with proper semantics',
    prerequisiteIds: ['semantic-elements'],
    order: 6,
    estimatedMinutes: 20,
  },
  {
    id: 'accessibility-basics',
    subjectId: 'html-basics',
    name: 'Accessibility Fundamentals',
    description: 'Making HTML accessible to all users',
    prerequisiteIds: ['semantic-elements', 'forms-inputs', 'images-media'],
    order: 7,
    estimatedMinutes: 25,
  },
  {
    id: 'meta-seo',
    subjectId: 'html-basics',
    name: 'Meta Tags and SEO',
    description: 'Optimizing HTML for search engines',
    prerequisiteIds: ['html-structure'],
    order: 8,
    estimatedMinutes: 15,
  },
];

// Sample Concept Content
export const conceptContents: Record<string, ConceptContent> = {
  'html-structure': {
    conceptId: 'html-structure',
    explanation: `Every HTML document follows a specific structure. The \`<!DOCTYPE html>\` declaration tells the browser this is an HTML5 document. The \`<html>\` element wraps everything, containing \`<head>\` for metadata and \`<body>\` for visible content.

The head section includes the page title, character encoding, and links to stylesheets. The body contains all the content users see and interact with.`,
    thinkingTask: {
      id: 'tt-html-structure',
      type: 'fix',
      prompt: 'The following HTML has structural errors. Identify what\'s wrong and explain why it matters:',
      context: `<!DOCTYPE>
<html>
<title>My Page</title>
<body>
<head>
  <meta charset="UTF-8">
</head>
  <h1>Welcome</h1>
</body>
</html>`,
      expectedInsights: [
        'DOCTYPE is incomplete - should be <!DOCTYPE html>',
        'head and body order is wrong - head should come before body',
        'title should be inside head, not directly in html',
        'Structure matters for browser parsing and rendering',
      ],
    },
    reflectionPrompts: [
      'What part of HTML structure confused you the most?',
      'What mistake did you make while analyzing the code?',
      'How confident are you about identifying structural errors?',
    ],
    microApplication: {
      id: 'ma-html-structure',
      prompt: 'Write the minimal valid HTML5 document structure with a title "My First Page" and a single paragraph saying "Hello World"',
      rubric: [
        'Includes correct DOCTYPE declaration',
        'Has html element with head and body',
        'Title is inside head',
        'Paragraph is inside body',
      ],
    },
  },
  'semantic-elements': {
    conceptId: 'semantic-elements',
    explanation: `Semantic HTML uses elements that describe their meaning. Instead of generic \`<div>\` containers, use \`<header>\`, \`<nav>\`, \`<main>\`, \`<article>\`, \`<section>\`, \`<aside>\`, and \`<footer>\`.

These elements help screen readers navigate, improve SEO, and make code more readable. A \`<nav>\` clearly indicates navigation, while a \`<div class="nav">\` requires interpretation.`,
    thinkingTask: {
      id: 'tt-semantic',
      type: 'compare',
      prompt: 'Compare these two approaches. Which is better and why?',
      context: `Option A:
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>

Option B:
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>`,
      expectedInsights: [
        'Option B uses semantic elements',
        'Screen readers understand the structure in Option B',
        'Option B is more maintainable and readable',
        'Links should be actual anchor elements, not divs',
      ],
    },
    reflectionPrompts: [
      'Which semantic element was new to you?',
      'What mistake did you make in your reasoning?',
      'How confident are you about choosing the right semantic element?',
    ],
    microApplication: {
      id: 'ma-semantic',
      prompt: 'Convert this div-based layout to semantic HTML: A page with a logo header, navigation menu, main content area with an article, and a footer with copyright.',
      rubric: [
        'Uses header element for top section',
        'Uses nav for navigation',
        'Uses main and article appropriately',
        'Uses footer for bottom section',
      ],
    },
  },
};

// Sample Students
export const sampleStudents: User[] = [
  { id: 'student-1', name: 'Alex Chen', email: 'alex@school.edu', role: 'student', createdAt: new Date('2024-09-01') },
  { id: 'student-2', name: 'Maya Patel', email: 'maya@school.edu', role: 'student', createdAt: new Date('2024-09-01') },
  { id: 'student-3', name: 'Jordan Smith', email: 'jordan@school.edu', role: 'student', createdAt: new Date('2024-09-01') },
  { id: 'student-4', name: 'Priya Sharma', email: 'priya@school.edu', role: 'student', createdAt: new Date('2024-09-02') },
  { id: 'student-5', name: 'Liam O\'Connor', email: 'liam@school.edu', role: 'student', createdAt: new Date('2024-09-02') },
  { id: 'student-6', name: 'Sofia Rodriguez', email: 'sofia@school.edu', role: 'student', createdAt: new Date('2024-09-02') },
  { id: 'student-7', name: 'Aiden Kim', email: 'aiden@school.edu', role: 'student', createdAt: new Date('2024-09-03') },
  { id: 'student-8', name: 'Emma Wilson', email: 'emma@school.edu', role: 'student', createdAt: new Date('2024-09-03') },
];

// Sample Mastery Data
export const sampleMasteryData: ConceptMastery[] = [
  // Alex Chen - Strong student
  { studentId: 'student-1', conceptId: 'html-structure', masteryScore: 92, masteryLevel: 'expert', lastUpdated: new Date(), evidenceCount: 5, trend: 'stable' },
  { studentId: 'student-1', conceptId: 'semantic-elements', masteryScore: 88, masteryLevel: 'proficient', lastUpdated: new Date(), evidenceCount: 4, trend: 'improving' },
  { studentId: 'student-1', conceptId: 'forms-inputs', masteryScore: 75, masteryLevel: 'proficient', lastUpdated: new Date(), evidenceCount: 3, trend: 'improving' },
  { studentId: 'student-1', conceptId: 'links-navigation', masteryScore: 85, masteryLevel: 'proficient', lastUpdated: new Date(), evidenceCount: 4, trend: 'stable' },
  { studentId: 'student-1', conceptId: 'images-media', masteryScore: 70, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 2, trend: 'stable' },
  
  // Maya Patel - Has gaps
  { studentId: 'student-2', conceptId: 'html-structure', masteryScore: 78, masteryLevel: 'proficient', lastUpdated: new Date(), evidenceCount: 5, trend: 'stable' },
  { studentId: 'student-2', conceptId: 'semantic-elements', masteryScore: 45, masteryLevel: 'emerging', lastUpdated: new Date(), evidenceCount: 4, trend: 'declining' },
  { studentId: 'student-2', conceptId: 'forms-inputs', masteryScore: 38, masteryLevel: 'novice', lastUpdated: new Date(), evidenceCount: 3, trend: 'stable' },
  { studentId: 'student-2', conceptId: 'links-navigation', masteryScore: 65, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 3, trend: 'improving' },
  
  // Jordan Smith - Struggling
  { studentId: 'student-3', conceptId: 'html-structure', masteryScore: 55, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 6, trend: 'stable' },
  { studentId: 'student-3', conceptId: 'semantic-elements', masteryScore: 32, masteryLevel: 'novice', lastUpdated: new Date(), evidenceCount: 4, trend: 'declining' },
  
  // Priya Sharma - Good progress
  { studentId: 'student-4', conceptId: 'html-structure', masteryScore: 85, masteryLevel: 'proficient', lastUpdated: new Date(), evidenceCount: 4, trend: 'improving' },
  { studentId: 'student-4', conceptId: 'semantic-elements', masteryScore: 72, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 3, trend: 'improving' },
  { studentId: 'student-4', conceptId: 'forms-inputs', masteryScore: 68, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 2, trend: 'stable' },
  
  // Liam - False confidence case
  { studentId: 'student-5', conceptId: 'html-structure', masteryScore: 60, masteryLevel: 'developing', lastUpdated: new Date(), evidenceCount: 4, trend: 'stable' },
  { studentId: 'student-5', conceptId: 'semantic-elements', masteryScore: 40, masteryLevel: 'emerging', lastUpdated: new Date(), evidenceCount: 3, trend: 'stable' },
];

// Sample Gap Insights
export const sampleGapInsights: GapInsight[] = [
  {
    id: 'gap-1',
    studentId: 'student-2',
    conceptId: 'semantic-elements',
    type: 'missing_prerequisite',
    description: 'Struggling with semantic elements due to weak understanding of HTML document structure',
    severity: 'high',
    suggestedAction: 'Review HTML Document Structure concept before proceeding',
    detectedAt: new Date(),
  },
  {
    id: 'gap-2',
    studentId: 'student-3',
    conceptId: 'html-structure',
    type: 'misconception',
    description: 'Repeatedly confusing head and body element purposes',
    severity: 'medium',
    suggestedAction: 'Targeted practice on head vs body element roles',
    detectedAt: new Date(),
  },
  {
    id: 'gap-3',
    studentId: 'student-5',
    conceptId: 'semantic-elements',
    type: 'false_confidence',
    description: 'High confidence (5/5) but incorrect answers on semantic element selection',
    severity: 'high',
    suggestedAction: 'Provide feedback that challenges assumptions about semantic elements',
    detectedAt: new Date(),
  },
  {
    id: 'gap-4',
    studentId: 'student-1',
    conceptId: 'images-media',
    type: 'fragile_understanding',
    description: 'Correct answers but low confidence (2/5) - understanding may not be solid',
    severity: 'low',
    suggestedAction: 'Additional practice to build confidence',
    detectedAt: new Date(),
  },
];

// Current logged-in user (demo)
export const currentStudent: User = sampleStudents[0];

export const currentTeacher: User = {
  id: 'teacher-1',
  name: 'Dr. Sarah Mitchell',
  email: 'sarah.mitchell@school.edu',
  role: 'teacher',
  createdAt: new Date('2024-01-15'),
};

// Helper to get mastery level from score
export function getMasteryLevel(score: number): { level: string; color: string } {
  if (score >= 90) return { level: 'Expert', color: 'mastery-expert' };
  if (score >= 75) return { level: 'Proficient', color: 'mastery-proficient' };
  if (score >= 55) return { level: 'Developing', color: 'mastery-developing' };
  if (score >= 35) return { level: 'Emerging', color: 'mastery-emerging' };
  return { level: 'Novice', color: 'mastery-novice' };
}

// Helper to get mastery color class
export function getMasteryColorClass(score: number): string {
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 75) return 'bg-teal-500';
  if (score >= 55) return 'bg-amber-500';
  if (score >= 35) return 'bg-orange-500';
  return 'bg-red-500';
}
