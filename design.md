# Design Document: EduTrace Platform

## Overview

EduTrace is a web-based learning intelligence platform that shifts focus from measuring marks to measuring actual understanding and thinking. The system is built around three core pillars:

1. **Concept-Based Learning**: Students learn through discrete concepts (not chapters) using a structured 4-step process
2. **Evidence Capture**: Every interaction generates evidence about student thinking, confidence, and understanding
3. **Intelligent Analysis**: Rule-based algorithms detect gaps, misconceptions, and learning patterns

The platform serves three user roles (Students, Teachers, Admins) with distinct interfaces and capabilities. The architecture emphasizes data capture, real-time scoring, and actionable insights.

## Architecture

### System Architecture

The platform follows a three-tier web architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    Presentation Layer                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Student    │  │   Teacher    │  │    Admin     │  │
│  │      UI      │  │      UI      │  │      UI      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │     Auth     │  │   Learning   │  │  Analytics   │  │
│  │   Service    │  │   Engine     │  │   Engine     │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                    │
│  │   Evidence   │  │   Mastery    │                    │
│  │   Capture    │  │   Scoring    │                    │
│  └──────────────┘  └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                      Data Layer                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Users     │  │   Concepts   │  │   Evidence   │  │
│  │      DB      │  │      DB      │  │      DB      │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key Architectural Decisions

1. **Monolithic Web Application**: Single deployable unit for simplicity and ease of maintenance in school environments
2. **Relational Database**: Strong consistency requirements for evidence and mastery scores
3. **Server-Side Rendering with Client-Side Interactivity**: Balance between performance and user experience
4. **Rule-Based Gap Detection**: Deterministic, explainable algorithms rather than black-box ML

## Components and Interfaces

### 1. Authentication Service

**Responsibility**: Manage user authentication, session management, and role-based access control.

**Interface**:
```
authenticate(email: String, password: String) -> Result<User, AuthError>
register(email: String, password: String, role: UserRole) -> Result<User, RegistrationError>
getCurrentUser(sessionToken: String) -> Result<User, SessionError>
logout(sessionToken: String) -> Result<Void, SessionError>
```

**Key Operations**:
- Validate credentials against stored hashed passwords
- Create and manage session tokens
- Determine redirect target based on user role

### 2. Learning Engine

**Responsibility**: Orchestrate the 4-step concept learning flow and manage concept content delivery.

**Interface**:
```
getConceptExplanation(conceptId: ConceptId) -> ConceptExplanation
getThinkingTask(conceptId: ConceptId) -> ThinkingTask
getReflectionQuestions(conceptId: ConceptId) -> ReflectionQuestions
getMicroApplication(conceptId: ConceptId) -> MicroApplication
submitTaskAnswer(studentId: StudentId, taskId: TaskId, answer: String) -> SubmissionResult
```

**Key Operations**:
- Retrieve concept content for each learning step
- Validate task submissions
- Coordinate with Evidence Capture for data storage

### 3. Evidence Capture Service

**Responsibility**: Record all student interaction data for analysis and scoring.

**Interface**:
```
captureEvidence(evidence: Evidence) -> Result<EvidenceId, CaptureError>
getStudentEvidence(studentId: StudentId, conceptId: ConceptId) -> List<Evidence>
getStudentAttempts(studentId: StudentId, taskId: TaskId) -> List<Attempt>
```

**Data Structure**:
```
Evidence {
  studentId: StudentId
  conceptId: ConceptId
  taskId: TaskId
  answerText: String
  timeTaken: Duration
  attemptNumber: Integer
  correctness: Correctness  // Correct | Incorrect | Partial
  confidenceScore: Integer  // 1-5
  reflectionText: String
  timestamp: DateTime
}
```

### 4. Mastery Scoring Engine

**Responsibility**: Calculate and update Concept Mastery Scores based on evidence.

**Interface**:
```
calculateMasteryScore(studentId: StudentId, conceptId: ConceptId) -> MasteryScore
updateMasteryScore(studentId: StudentId, conceptId: ConceptId, newEvidence: Evidence) -> MasteryScore
getMasteryScores(studentId: StudentId) -> Map<ConceptId, MasteryScore>
```

**Scoring Algorithm**:
```
MasteryScore = weighted_average(
  accuracy_score * 0.40,
  confidence_alignment_score * 0.25,
  improvement_score * 0.20,
  explanation_quality_score * 0.15
)

where:
  accuracy_score = percentage of correct answers
  confidence_alignment_score = 100 - abs(confidence - actual_performance)
  improvement_score = (latest_performance - initial_performance) / attempts
  explanation_quality_score = heuristic based on answer length and keywords
```

### 5. Gap Detection Engine

**Responsibility**: Analyze evidence patterns to detect misconceptions and knowledge gaps.

**Interface**:
```
detectGaps(studentId: StudentId, conceptId: ConceptId) -> List<ConceptGap>
detectClassGaps(classId: ClassId) -> Map<ConceptId, List<ConceptGap>>
generateGapInsight(gap: ConceptGap) -> String
```

**Detection Rules**:
```
Rule 1: Fragile Understanding
  IF (correctness = Correct) AND (confidence <= 2) AND (occurrences >= 2)
  THEN gap_type = FragileUnderstanding

Rule 2: Misconception
  IF (same_error_pattern >= 3) AND (confidence >= 3)
  THEN gap_type = Misconception

Rule 3: Missing Prerequisite
  IF (advanced_concept.correctness = Incorrect) AND 
     (prerequisite_concept.mastery_score < 60)
  THEN gap_type = MissingPrerequisite

Rule 4: False Confidence
  IF (correctness = Incorrect) AND (confidence >= 4) AND (occurrences >= 2)
  THEN gap_type = FalseConfidence
```

**Insight Generation**:
```
generateInsight(gap):
  MATCH gap.type:
    FragileUnderstanding -> 
      "Student shows correct answers but lacks confidence in {concept}. Needs reinforcement."
    Misconception -> 
      "Student repeatedly makes the same error in {concept}. Specific misconception detected."
    MissingPrerequisite -> 
      "Student shows weak understanding of prerequisite concept: {prerequisite_concept}"
    FalseConfidence -> 
      "Student shows high confidence but incorrect answers in {concept}. Needs correction."
```

### 6. Analytics Engine

**Responsibility**: Generate dashboards and insights for teachers and students.

**Interface**:
```
getStudentDashboard(studentId: StudentId) -> StudentDashboard
getTeacherDashboard(teacherId: TeacherId) -> TeacherDashboard
getConceptHeatmap(classId: ClassId) -> ConceptHeatmap
detectLearningBehavior(studentId: StudentId) -> LearningBehavior
```

**Learning Behavior Detection**:
```
detectBehavior(student):
  evidence = getAllEvidence(student)
  
  // Logical vs Memorization
  IF (explanation_quality_avg > 70) AND (confidence_alignment > 80)
    THEN behavior.understanding_type = Logical
  ELSE IF (accuracy > 70) BUT (explanation_quality_avg < 40)
    THEN behavior.understanding_type = Memorization
  
  // Effort vs Performance
  effort_score = (total_time_spent + total_attempts) / concepts_attempted
  performance_score = average_mastery_score
  
  IF (effort_score > 75) AND (performance_score < 60)
    THEN behavior.pattern = HighEffortLowPerformance
  
  // Silent Weakness
  IF (confidence_avg > 4) AND (mastery_score_avg < 50)
    THEN behavior.pattern = SilentlyWeak
```

### 7. Personalized Learning Path Generator

**Responsibility**: Create customized concept sequences based on mastery and gaps.

**Interface**:
```
generateLearningPath(studentId: StudentId) -> LearningPath
updateLearningPath(studentId: StudentId) -> LearningPath
getNextConcept(studentId: StudentId) -> ConceptId
```

**Path Generation Algorithm**:
```
generatePath(student):
  mastery_scores = getMasteryScores(student)
  gaps = detectGaps(student)
  
  // Priority 1: Concepts with detected gaps
  priority_concepts = concepts_with_gaps(gaps)
  
  // Priority 2: Low mastery concepts
  weak_concepts = filter(mastery_scores, score < 60)
  
  // Priority 3: Prerequisite ordering
  ordered_concepts = topological_sort(
    priority_concepts + weak_concepts,
    prerequisite_graph
  )
  
  RETURN LearningPath(ordered_concepts)
```

### 8. Admin Management Service

**Responsibility**: Handle platform configuration and user management.

**Interface**:
```
createClass(className: String, grade: String) -> ClassId
addSubject(classId: ClassId, subjectName: String) -> SubjectId
createStudent(email: String, password: String, classId: ClassId) -> StudentId
createTeacher(email: String, password: String) -> TeacherId
assignTeacherToClass(teacherId: TeacherId, classId: ClassId) -> Result<Void, Error>
getOverallAnalytics() -> PlatformAnalytics
```

## Data Models

### User Models

```
User {
  id: UserId (UUID)
  email: String (unique, indexed)
  passwordHash: String
  role: UserRole (Student | Teacher | Admin)
  createdAt: DateTime
  lastLogin: DateTime
}

Student extends User {
  classId: ClassId
  enrollmentDate: DateTime
}

Teacher extends User {
  assignedClasses: List<ClassId>
}

Admin extends User {
  permissions: List<Permission>
}
```

### Learning Models

```
Subject {
  id: SubjectId (UUID)
  name: String
  description: String
  concepts: List<ConceptId>
}

Concept {
  id: ConceptId (UUID)
  subjectId: SubjectId
  name: String
  explanation: String
  explanationImage: Optional<URL>
  prerequisites: List<ConceptId>
  difficulty: Integer (1-5)
}

ThinkingTask {
  id: TaskId (UUID)
  conceptId: ConceptId
  questionText: String
  taskType: TaskType (Predict | Explain | Correct | Compare | Justify)
  expectedAnswerPattern: String
}

ReflectionQuestions {
  confusionPrompt: String
  mistakesPrompt: String
  confidencePrompt: String
}

MicroApplication {
  id: TaskId (UUID)
  conceptId: ConceptId
  taskDescription: String
  expectedOutcome: String
}
```

### Evidence and Scoring Models

```
Evidence {
  id: EvidenceId (UUID)
  studentId: StudentId (indexed)
  conceptId: ConceptId (indexed)
  taskId: TaskId
  answerText: String
  timeTaken: Duration (seconds)
  attemptNumber: Integer
  correctness: Correctness
  confidenceScore: Integer (1-5)
  reflectionText: String
  timestamp: DateTime (indexed)
}

Correctness = Correct | Incorrect | Partial

MasteryScore {
  studentId: StudentId (indexed)
  conceptId: ConceptId (indexed)
  score: Float (0-100)
  accuracyComponent: Float
  confidenceAlignmentComponent: Float
  improvementComponent: Float
  explanationQualityComponent: Float
  lastUpdated: DateTime
  version: Integer
}

ConceptGap {
  id: GapId (UUID)
  studentId: StudentId (indexed)
  conceptId: ConceptId
  gapType: GapType (FragileUnderstanding | Misconception | MissingPrerequisite | FalseConfidence)
  detectedAt: DateTime
  insightMessage: String
  resolved: Boolean
}

GapType = FragileUnderstanding | Misconception | MissingPrerequisite | FalseConfidence
```

### Class and Assignment Models

```
Class {
  id: ClassId (UUID)
  name: String
  grade: String
  subjects: List<SubjectId>
  students: List<StudentId>
  teachers: List<TeacherId>
  createdAt: DateTime
}

LearningPath {
  studentId: StudentId (indexed)
  orderedConcepts: List<ConceptId>
  currentPosition: Integer
  lastUpdated: DateTime
}
```

### Analytics Models

```
StudentDashboard {
  studentId: StudentId
  subjectProgress: Map<SubjectId, ProgressMetrics>
  conceptMastery: Map<ConceptId, MasteryScore>
  strengths: List<ConceptId>
  weaknesses: List<ConceptId>
  improvementTrend: TrendData
}

ProgressMetrics {
  totalConcepts: Integer
  masteredConcepts: Integer
  inProgressConcepts: Integer
  averageMasteryScore: Float
}

TeacherDashboard {
  teacherId: TeacherId
  classId: ClassId
  conceptHeatmap: ConceptHeatmap
  weakestConcepts: List<ConceptId>
  studentBehaviors: Map<StudentId, LearningBehavior>
  effortVsPerformance: List<StudentMetrics>
}

ConceptHeatmap {
  classId: ClassId
  heatmapData: Map<ConceptId, Map<StudentId, MasteryScore>>
}

LearningBehavior {
  studentId: StudentId
  understandingType: UnderstandingType (Logical | Memorization | Mixed)
  effortLevel: EffortLevel (High | Medium | Low)
  performanceLevel: PerformanceLevel (High | Medium | Low)
  patterns: List<BehaviorPattern>
}

BehaviorPattern = HighEffortLowPerformance | SilentlyWeak | QuickLearner | Struggling

StudentMetrics {
  studentId: StudentId
  effortScore: Float
  performanceScore: Float
  totalTimeSpent: Duration
  totalAttempts: Integer
  averageMastery: Float
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

