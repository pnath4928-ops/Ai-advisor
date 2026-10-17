import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import mongoose from 'mongoose';
import { AISuggestion, IAISuggestion } from '../models/AISuggestion';
import { Student } from '../models/Student';
import { AcademicRecord } from '../models/AcademicRecord';
import { SubjectTopic } from '../models/SubjectTopic';
import { StudyPlan, IStudyPlan } from '../models/StudyPlan';
import { StudyTask, IStudyTask } from '../models/StudyTask';
import { Exam } from '../models/Exam';
import { StudyProgress } from '../models/StudyProgress';
import { StudySession } from '../models/StudySession';
import { StudyTopic } from '../models/StudyTopic';
import { Assignment, IAssignment } from '../models/Assignment';
import { User } from '../models/User';
import env from '../config/env';

interface StudyData {
  student: {
    name: string;
    learningPreference: string;
    preferredStudyTime: string;
    preferredStudyTechnique: string;
    academicGoal: string;
  };
  academicRecords: {
    subjectName: string;
    grade: string;
    score: number;
    term: string;
    teacherNotes: string;
  }[];
  subjectTopics: {
    topicName: string;
    rating: string;
    remarks: string;
    subjectName: string;
  }[];
  currentPlan: {
    weekStartDate: Date;
  } | null;
  upcomingExams: {
    subjectName: string;
    examDate: Date;
    examType: string;
    preparationLevel: number;
  }[];
  recentProgress: {
    actualMinutes: number;
    focusScore: number;
  }[];
}

type PlanScope = 'day' | 'week';

interface PlanTask {
  day: string;
  subjectName: string;
  topic: string;
  plannedMinutes: number;
  studyTechnique?: string;
  reason?: string;
}

interface PlanJSON {
  reasoning?: string;
  focus?: string[];
  tasks?: PlanTask[];
}

const WEEK_DAY_ORDER = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const WEEK_DAY_ORDER_MON = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const todayDayName = (): string => new Date().toLocaleDateString('en-US', { weekday: 'long' });

const isPastDay = (day: string): boolean => {
  const todayIdx = WEEK_DAY_ORDER_MON.indexOf(todayDayName());
  const dayIdx = WEEK_DAY_ORDER_MON.indexOf(day);
  if (todayIdx === -1 || dayIdx === -1) return false;
  return dayIdx < todayIdx;
};

const remainingWeekDays = (): string[] => {
  const today = todayDayName();
  const idx = WEEK_DAY_ORDER_MON.indexOf(today);
  return idx === -1 ? [today] : WEEK_DAY_ORDER_MON.slice(idx);
};

const formatPlanText = (parsed: PlanJSON, tasks: PlanTask[], scope: PlanScope): string => {
  const lines: string[] = [];
  if (parsed.reasoning) lines.push(parsed.reasoning);
  if (parsed.focus?.length) {
    lines.push('', 'FOCUS AREAS:');
    for (const f of parsed.focus) lines.push(`- ${f}`);
  }
  lines.push('', scope === 'week' ? 'WEEKLY SCHEDULE (today to Sunday):' : "TODAY'S SCHEDULE:");
  const grouped = new Map<string, PlanTask[]>();
  for (const t of tasks) {
    if (!grouped.has(t.day)) grouped.set(t.day, []);
    grouped.get(t.day)!.push(t);
  }
  for (const day of WEEK_DAY_ORDER) {
    const dayTasks = grouped.get(day);
    if (!dayTasks?.length) continue;
    for (const t of dayTasks) {
      lines.push(`- ${day} | ${t.subjectName} — ${t.topic} (${t.plannedMinutes}min, ${t.studyTechnique || 'focused'})${t.reason ? ` | ${t.reason}` : ''}`);
    }
  }
  return lines.join('\n');
};

const REQUEST_TIMEOUT_MS = 30000;

const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

async function retry<T>(fn: () => Promise<T>, attempts: number, delayMs: number): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await sleep(delayMs);
    }
  }
  throw lastErr;
}

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms);
    promise.then(
      (value) => { clearTimeout(timer); resolve(value); },
      (err) => { clearTimeout(timer); reject(err); },
    );
  });

async function createChatCompletion(
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
  options?: Record<string, unknown>
): Promise<string | null> {
  const openaiKey = env.OPENAI_API_KEY;
  if (openaiKey && openaiKey !== 'your_openai_key_here') {
    try {
      const openai = new OpenAI({ apiKey: openaiKey, timeout: REQUEST_TIMEOUT_MS });
      const { max_tokens, ...rest } = options || {};
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages as any,
        ...rest,
        max_completion_tokens: max_tokens as number | undefined,
      } as any);
      return completion.choices[0].message.content;
    } catch (err) {
      console.error('OpenAI error:', err);
    }
  }

  const googleKey = env.GOOGLE_API_KEY;
  if (googleKey && googleKey !== 'your_google_key_here') {
    try {
      const genAI = new GoogleGenAI({ apiKey: googleKey });
      const prompt = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');
      const result = await retry(() => withTimeout(genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { maxOutputTokens: 2048 },
      }), REQUEST_TIMEOUT_MS), 2, 1200);
      const text = result.text?.trim();
      return text || null;
    } catch (err) {
      console.error('Google AI error:', err);
    }
  }

  return null;
};

const resolveStudentId = async (userId: string): Promise<mongoose.Types.ObjectId> => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student not found');
  return student._id as mongoose.Types.ObjectId;
};

const buildStudyPrompt = (data: StudyData, type: string): string => {
  const baseContext = `
Student: ${data.student.name}
Learning Preference: ${data.student.learningPreference}
Preferred Study Time: ${data.student.preferredStudyTime}
Preferred Study Technique: ${data.student.preferredStudyTechnique}
Academic Goal: ${data.student.academicGoal}

Academic Performance:
${data.academicRecords.map(r => `- ${r.subjectName}: ${r.grade} (${r.score}%) - ${r.teacherNotes}`).join('\n') || 'No records yet'}

Subject Topics:
${data.subjectTopics.map(t => `- ${t.subjectName} / ${t.topicName}: ${t.rating} - ${t.remarks}`).join('\n') || 'No topics evaluated yet'}

Current Study Plan: ${data.currentPlan ? `Active plan since ${new Date(data.currentPlan.weekStartDate).toLocaleDateString()}` : 'No active plan'}

Upcoming Exams:
${data.upcomingExams.map(e => `- ${e.subjectName} (${e.examType}) on ${new Date(e.examDate).toLocaleDateString()}: Preparation Level ${e.preparationLevel}%`).join('\n') || 'No upcoming exams'}

Recent Progress:
${data.recentProgress.map(p => `- Studied ${p.actualMinutes} minutes, Focus Score: ${p.focusScore}/10`).join('\n') || 'No recent progress'}
`;

  switch (type) {
    case 'plan':
      return `${baseContext}

Based on this student's data, generate a comprehensive weekly study plan. Include:
1. Daily study schedule with specific times
2. Subject allocation based on priority and weak areas
3. Break times and review sessions
4. Recommended study techniques for each subject
Format as a structured weekly plan.`;

    case 'daily':
      return `${baseContext}

Based on this student's current progress and upcoming deadlines, recommend today's study tasks. Include:
1. Priority tasks for today
2. Time allocation for each task
3. Specific topics to focus on
4. Quick review suggestions
Format as a prioritized task list with time estimates.`;

    case 'weakness':
      return `${baseContext}

Analyze this student's academic performance and identify weak subjects/topics. Provide:
1. List of weak areas with evidence
2. Root cause analysis
3. Targeted improvement strategies
4. Resources or methods to strengthen these areas
Format as a weakness analysis report.`;

    case 'revision':
      return `${baseContext}

Based on upcoming exams and current progress, create a revision strategy. Include:
1. Revision schedule leading up to exams
2. Key topics to focus on
3. Revision techniques (active recall, spaced repetition, etc.)
4. Practice test suggestions
5. Time management tips
Format as a structured revision plan.`;

    default:
      return `${baseContext}\nProvide general study recommendations for this student.`;
  }
};

const buildPlanPrompt = (context: string, scope: PlanScope): string => {
  const today = todayDayName();

  return `You are an AI study advisor. Analyze the student's FULL data below and create the most effective ${scope === 'day' ? `study plan for TODAY (${today})` : 'study plan for the REST OF THIS WEEK (today through Sunday)'}.

STUDENT DATA:
${context}

Return ONLY valid JSON with exactly this structure:
{
  "reasoning": "2-3 sentence summary of what this plan optimizes for (weak subjects, exam dates, assignment deadlines, workload balance)",
  "focus": ["3-5 short priorities for this ${scope}, e.g. 'Prepare for Mathematics midterm on Aug 7'"],
  "tasks": [
    {
      "day": "${today}",
      "subjectName": "Mathematics",
      "topic": "Quadratic equations practice",
      "plannedMinutes": 60,
      "studyTechnique": "pomodoro",
      "reason": "Exam on Aug 7 and weakest subject"
    }
  ]
}

Rules:
- Use ONLY the provided data to choose subjects and topics. Prioritize weak subjects and weak topics, nearest exams (allocate more minutes the closer the exam), pending assignment deadlines, and incomplete study tasks.
- ${scope === 'day'
    ? `Only include tasks for ${today}.`
    : 'Include tasks for the remaining days of this week starting today (today through Sunday). Do NOT include any days before today.'}
- 2-5 tasks per day, max 3-5 hours of study total per day.
- Prefer the student's preferred study technique where sensible.
- Keep "reasoning" to 2-3 sentences and each "reason" to ONE short phrase.
- Do not include any text before or after the JSON.`;
};

const generateMockResponse = (type: string): string => {
  const mockResponses: Record<string, string> = {
    plan: `Weekly Study Plan:

Monday:
- 9:00-11:00: Mathematics (High Priority) - Focus on algebra and calculus
- 14:00-15:30: Physics - Review mechanics concepts

Tuesday:
- 9:00-10:30: Chemistry - Organic chemistry revision
- 14:00-16:00: English Literature - Essay writing practice

Wednesday:
- 9:00-11:00: Mathematics (High Priority) - Problem-solving session
- 14:00-15:00: History - Timeline review

Thursday:
- 9:00-10:30: Biology - Cell biology notes
- 14:00-16:00: Physics - Lab report preparation

Friday:
- 9:00-11:00: Mathematics (High Priority) - Past papers
- 14:00-15:30: Chemistry - Practice equations

Saturday:
- 10:00-12:00: Weak subjects review
- 14:00-15:00: Weekly progress assessment

Sunday:
- Rest day with light review of notes
- 16:00-17:00: Plan next week

Study Tips:
- Use Pomodoro technique (25min study, 5min break)
- Review notes within 24 hours of learning
- Practice active recall instead of passive reading`,

    daily: `Today's Study Tasks (Priority Order):

1. Mathematics - Calculus Practice (2 hours)
   - Topic: Integration techniques
   - Priority: HIGH
   - Complete 10 practice problems

2. Physics - Mechanics Review (1.5 hours)
   - Topic: Newton's laws applications
   - Priority: MEDIUM
   - Review textbook Chapter 5

3. Chemistry - Organic Chemistry (1 hour)
   - Topic: Reaction mechanisms
   - Priority: MEDIUM
   - Watch Khan Academy video + notes

4. English - Essay Planning (45 min)
   - Topic: Literature analysis
   - Priority: LOW
   - Outline tomorrow's essay

Break Schedule:
- 10:30-10:45: Short break
- 12:00-13:00: Lunch break
- 15:00-15:15: Afternoon break

Remember: Take notes actively and test yourself!`,

    weakness: `Weakness Analysis Report:

IDENTIFIED WEAK AREAS:

1. Chemistry - Score: 62% (Below Average)
   Evidence: Recent test scores, teacher comments on lab reports
   Root Cause: Difficulty with organic chemistry concepts
   Recommendation: Focus on reaction mechanisms, use molecular models

2. History - Score: 68% (Needs Improvement)
   Evidence: Inconsistent essay scores
   Root Cause: Difficulty organizing historical events chronologically
   Recommendation: Create visual timelines, use mnemonic devices

3. Physics - Score: 71% (Average)
   Evidence: Struggling with problem-solving questions
   Root Cause: Weak foundation in mathematical applications
   Recommendation: Strengthen math-physics connection, practice more problems

IMPROVEMENT STRATEGIES:

For Chemistry:
- Join study group for lab discussions
- Use online simulations for molecular visualization
- Practice naming compounds daily

For History:
- Create mind maps for each period
- Watch documentary series for context
- Practice writing structured essays

For Physics:
- Review mathematical formulas weekly
- Solve 5 problems daily
- Attend teacher office hours

TARGET: Improve all weak subjects by 10-15% within 4 weeks.`,

    revision: `Exam Revision Strategy:

UPCOMING EXAMS:
${'- Mathematics in 2 weeks\n- Chemistry in 3 weeks\n- Physics in 4 weeks'}

WEEK-BY-WEEK PLAN:

Week 1 (Mathematics Focus):
- Day 1-3: Algebra and Functions revision
- Day 4-5: Calculus practice problems
- Day 6-7: Past papers and timed practice

Week 2 (Mathematics + Chemistry):
- Day 1-3: Mathematics final revision + practice tests
- Day 4-7: Chemistry - Organic chemistry deep dive

Week 3 (Chemistry + Physics):
- Day 1-3: Chemistry - Inorganic and Physical chemistry
- Day 4-7: Physics - Mechanics and Waves

Week 4 (Final Review):
- Day 1-2: Physics - Electricity and Magnetism
- Day 3-4: Mixed revision of all subjects
- Day 5: Light review and rest
- Day 6-7: Exam days

REVISION TECHNIQUES:

1. Active Recall:
   - Test yourself without looking at notes
   - Use flashcards for key concepts
   - Teach concepts to someone else

2. Spaced Repetition:
   - Review material at increasing intervals
   - Day 1 → Day 3 → Day 7 → Day 14

3. Practice Testing:
   - Complete past papers under timed conditions
   - Review mistakes immediately

4. Pomodoro Technique:
   - 25 minutes focused study
   - 5 minutes break
   - Longer break after 4 sessions

DAILY ROUTINE:
- Morning: Difficult subjects (peak focus)
- Afternoon: Practice problems
- Evening: Light review and note organization

REMEMBER: Sleep 7-8 hours, stay hydrated, take breaks!`,
  };

  return mockResponses[type] || mockResponses.plan;
};

const getWeekStart = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fetchStudyData = async (userId: string): Promise<StudyData> => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student not found');

  const user = await User.findById(student.userId);
  const academicRecords = await AcademicRecord.find({ studentId: student._id });

  const subjectTopics = await SubjectTopic.find({
    academicRecordId: { $in: academicRecords.map(r => r._id) },
  }).populate({ path: 'academicRecordId', select: 'subjectName' });

  const currentPlan = await StudyPlan.findOne({ studentId: student._id, status: 'active' });

  const upcomingExams = await Exam.find({
    studentId: student._id,
    examDate: { $gte: new Date() },
  }).sort({ examDate: 1 }).limit(5);

  const recentProgress = await StudyProgress.find({ studentId: student._id })
    .sort({ completedAt: -1 })
    .limit(5);

  return {
    student: {
      name: user?.name || 'Student',
      learningPreference: student.learningPreference,
      preferredStudyTime: student.preferredStudyTime,
      preferredStudyTechnique: student.preferredStudyTechnique,
      academicGoal: student.academicGoal,
    },
    academicRecords: academicRecords.map(r => ({
      subjectName: r.subjectName,
      grade: r.grade,
      score: r.score,
      term: r.term,
      teacherNotes: r.teacherNotes,
    })),
    subjectTopics: subjectTopics.map(st => ({
      topicName: st.topicName,
      rating: st.rating,
      remarks: st.remarks,
      subjectName: (st.academicRecordId as unknown as { subjectName: string })?.subjectName || 'Unknown',
    })),
    currentPlan: currentPlan ? { weekStartDate: currentPlan.weekStartDate } : null,
    upcomingExams: upcomingExams.map(e => ({
      subjectName: e.subjectName,
      examDate: e.examDate,
      examType: e.examType,
      preparationLevel: e.preparationLevel,
    })),
    recentProgress: recentProgress.map(p => ({
      actualMinutes: p.actualMinutes,
      focusScore: p.focusScore,
    })),
  };
};

export const generateAISuggestion = async (
  userId: string,
  type: 'plan' | 'daily' | 'weakness' | 'revision'
): Promise<IAISuggestion> => {
  const studentId = await resolveStudentId(userId);
  const studyData = await fetchStudyData(userId);

  const currentPlan = await StudyPlan.findOne({ studentId, status: 'active' });
  if (!currentPlan) {
    throw new Error('No active study plan found. Create a study plan first.');
  }

  const prompt = buildStudyPrompt(studyData, type);
  let suggestion: string;

  const aiResponse = await createChatCompletion(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7, max_tokens: 1500 }
  );
  suggestion = aiResponse || generateMockResponse(type);

  const targetDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return AISuggestion.create({
    studyPlanId: currentPlan._id,
    suggestionType: type,
    targetDay,
    reasoning: `Generated based on ${type} analysis of ${studyData.academicRecords.length} academic records, ${studyData.subjectTopics.length} topic evaluations, and ${studyData.recentProgress.length} recent progress entries.`,
    recommendedAction: suggestion,
    accepted: false,
  });
};

export const generateStudyPlanFromAI = async (
  userId: string,
  options?: { scope?: PlanScope }
): Promise<{
  plan: IStudyPlan;
  tasks: IStudyTask[];
  suggestion: IAISuggestion;
}> => {
  const scope: PlanScope = options?.scope === 'week' ? 'week' : 'day';
  const studentId = await resolveStudentId(userId);
  const studyData = await fetchStudyData(userId);

  const pendingAssignments = await Assignment.find({
    studentId,
    submitted: { $ne: true },
  }).sort({ dueDate: 1 }).limit(10);

  const hasData =
    studyData.academicRecords.length > 0 ||
    studyData.upcomingExams.length > 0 ||
    pendingAssignments.length > 0;
  if (!hasData) {
    throw new Error('You have no academic data yet. Add your exams, and ask your teacher to add your subjects and grades, then generate your AI plan.');
  }

  const weekStart = getWeekStart(new Date());

  let plan = await StudyPlan.findOne({ studentId, weekStartDate: weekStart, status: 'active' });
  if (!plan) {
    plan = await StudyPlan.create({ studentId, weekStartDate: weekStart, status: 'active' });
  }

  // Remove existing tasks and their topics for this plan before regenerating
  const existingTasks = await StudyTask.find({ studyPlanId: plan._id });
  if (existingTasks.length > 0) {
    const existingTaskIds = existingTasks.map(t => t._id);
    await StudyTopic.deleteMany({ studyTaskId: { $in: existingTaskIds } });
    await StudyTask.deleteMany({ studyPlanId: plan._id });
  }

  let parsed: PlanJSON | null = null;

  const context = await buildStudentContext(userId);
  const prompt = buildPlanPrompt(context, scope);
  const aiResponse = await createChatCompletion(
    [{ role: 'user', content: prompt }],
    { temperature: 0.7, max_tokens: 2000 }
  );
  if (aiResponse) {
    try {
      const candidate = JSON.parse(aiResponse);
      if (candidate && Array.isArray(candidate.tasks)) {
        parsed = candidate as PlanJSON;
      }
    } catch {
      // fall through to mock fallback below
    }
  }

  if (!parsed) {
    parsed = generateMockPlan(studyData, scope, { assignments: pendingAssignments, existingTasks });
  }

  // Keep only the days that belong to this scope
  const todayDay = todayDayName();
  const scopedTasks = (parsed.tasks || []).filter(t =>
    scope === 'week' ? !isPastDay(t.day) : t.day === todayDay
  );

  if (scopedTasks.length === 0) {
    const fallbackSubject =
      studyData.academicRecords[0]?.subjectName ||
      studyData.upcomingExams[0]?.subjectName ||
      pendingAssignments[0]?.subjectName;
    if (fallbackSubject) {
      scopedTasks.push({
        day: todayDay,
        subjectName: fallbackSubject,
        topic: `Review ${fallbackSubject} fundamentals`,
        plannedMinutes: 60,
        studyTechnique: studyData.student.preferredStudyTechnique || 'pomodoro',
        reason: 'Keep steady progress on your core subjects',
      });
    }
  }

  const createdTasks: IStudyTask[] = [];
  for (const task of scopedTasks) {
    const created = await StudyTask.create({
      studyPlanId: plan._id,
      day: task.day,
      subjectName: task.subjectName,
      plannedMinutes: task.plannedMinutes,
      studyTechnique: task.studyTechnique || studyData.student.preferredStudyTechnique,
      status: 'pending',
      studiedMinutes: 0,
      remainingMinutes: task.plannedMinutes,
      progressPercentage: 0,
    });

    // Create a StudyTopic for this AI-generated task topic
    await StudyTopic.create({
      studyTaskId: created._id,
      topicName: task.topic,
      plannedMinutes: task.plannedMinutes,
      studiedMinutes: 0,
      remainingMinutes: task.plannedMinutes,
      progressPercentage: 0,
      status: 'pending',
    });

    createdTasks.push(created);
  }

  const suggestion = await AISuggestion.create({
    studyPlanId: plan._id,
    suggestionType: 'plan',
    targetDay: todayDay,
    reasoning: parsed.reasoning || 'AI-generated study plan based on your latest data.',
    recommendedAction: formatPlanText(parsed, scopedTasks, scope),
    accepted: false,
  });

  return { plan, tasks: createdTasks, suggestion };
};

export const analyzeWeakSubjects = async (userId: string): Promise<{
  weakSubjects: { subjectName: string; score: number; weakTopics: string[]; recommendation: string }[];
  overallAnalysis: string;
}> => {
  const studentId = await resolveStudentId(userId);
  const academicRecords = await AcademicRecord.find({ studentId });

  const subjectTopics = await SubjectTopic.find({
    academicRecordId: { $in: academicRecords.map(r => r._id) },
  }).populate({ path: 'academicRecordId', select: 'subjectName score' });

  const subjectMap = new Map<string, { score: number; topics: { name: string; rating: string }[] }>();

  for (const record of academicRecords) {
    const topics = subjectTopics
      .filter(st => (st.academicRecordId as unknown as { _id: { toString(): string } })?._id?.toString() === record._id.toString())
      .map(st => ({ name: st.topicName, rating: st.rating }));

    subjectMap.set(record.subjectName, { score: record.score, topics });
  }

  const weakSubjects: { subjectName: string; score: number; weakTopics: string[]; recommendation: string }[] = [];

  for (const [subject, data] of subjectMap) {
    if (data.score < 75) {
      const weakTopics = data.topics
        .filter(t => t.rating === 'needs_improvement' || t.rating === 'average')
        .map(t => t.name);

      weakSubjects.push({
        subjectName: subject,
        score: data.score,
        weakTopics,
        recommendation: `Focus on ${weakTopics.length > 0 ? weakTopics.join(', ') : 'core concepts'}. Consider ${data.score < 60 ? 'extra tutoring' : 'more practice problems'}.`,
      });
    }
  }

  let overallAnalysis = `${weakSubjects.length} weak subject(s) identified out of ${subjectMap.size} total subjects.`;

  if (weakSubjects.length > 0) {
    const prompt = `Analyze these weak subjects and provide a concise 2-3 sentence improvement strategy:\n${weakSubjects.map(s => `- ${s.subjectName} (${s.score}%): weak topics = ${s.weakTopics.join(', ') || 'none specified'}`).join('\n')}`;
    const aiResponse = await createChatCompletion(
      [{ role: 'user', content: prompt }],
      { max_tokens: 300 }
    );
    if (aiResponse) overallAnalysis = aiResponse;
  }

  return { weakSubjects, overallAnalysis };
};

export const generateRevisionStrategy = async (userId: string): Promise<string> => {
  const studentId = await resolveStudentId(userId);
  const exams = await Exam.find({
    studentId,
    examDate: { $gte: new Date() },
  }).sort({ examDate: 1 });

  if (exams.length === 0) {
    return 'No upcoming exams found. Keep up your regular study routine and focus on strengthening weak areas.';
  }

  const progress = await StudyProgress.find({ studentId })
    .sort({ completedAt: -1 })
    .limit(10);

  const revisionPrompt = `Create a revision strategy for these upcoming exams:
${exams.map(e => `- ${e.subjectName} (${e.examType}) on ${new Date(e.examDate).toLocaleDateString()} — Preparation: ${e.preparationLevel}%`).join('\n')}

Recent study progress:
${progress.map(p => `- Studied ${p.actualMinutes}min, Focus: ${p.focusScore}/10`).join('\n') || 'No recent data'}

Provide a day-by-day revision plan with specific techniques. Be concise but actionable.`;
  const aiResponse = await createChatCompletion(
    [{ role: 'user', content: revisionPrompt }],
    { max_tokens: 1000 }
  );
  if (aiResponse) return aiResponse;

  return `Revision Strategy for ${exams.length} upcoming exam(s):

${exams.map((e, i) => {
  const daysUntil = Math.ceil((new Date(e.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  return `${i + 1}. ${e.subjectName} (${e.examType}) — ${daysUntil} days away
   - Current preparation: ${e.preparationLevel}%
   - Focus: ${e.preparationLevel < 50 ? 'foundational concepts and key formulas' : 'advanced problems and past papers'}
   - Daily: 1-2 hours of focused study using active recall`;
}).join('\n\n')}

General Tips:
- Study difficult subjects in the morning when focus is highest
- Use spaced repetition: review day 1 → day 3 → day 7
- Take 5-minute breaks every 25 minutes (Pomodoro)
- Get 7-8 hours of sleep before exam day`;
};

export const getSuggestions = async (
  userId: string,
  type?: string
): Promise<IAISuggestion[]> => {
  const studentId = await resolveStudentId(userId);
  const plans = await StudyPlan.find({ studentId }).select('_id');
  const planIds = plans.map((p) => p._id);

  const query: { studyPlanId: { $in: typeof planIds }; suggestionType?: string } = {
    studyPlanId: { $in: planIds },
  };
  if (type) query.suggestionType = type;

  return AISuggestion.find(query).sort({ createdAt: -1 });
};

export const acceptSuggestion = async (
  id: string,
  userId: string
): Promise<IAISuggestion | null> => {
  const studentId = await resolveStudentId(userId);
  const plans = await StudyPlan.find({ studentId }).select('_id');
  const planIds = plans.map((p) => p._id);

  return AISuggestion.findOneAndUpdate(
    { _id: id, studyPlanId: { $in: planIds } },
    { accepted: true },
    { new: true }
  );
};

export const rejectSuggestion = async (
  id: string,
  userId: string
): Promise<IAISuggestion | null> => {
  const studentId = await resolveStudentId(userId);
  const plans = await StudyPlan.find({ studentId }).select('_id');
  const planIds = plans.map((p) => p._id);

  return AISuggestion.findOneAndDelete({ _id: id, studyPlanId: { $in: planIds } });
};

const generateMockPlan = (
  data: StudyData,
  scope: PlanScope,
  extra: {
    assignments?: Array<{ subjectName: string; title: string; dueDate: Date }>;
    existingTasks?: Array<{ day: string; subjectName: string; status: string }>;
  } = {}
): PlanJSON => {
  const todayDay = todayDayName();
  const planDays = scope === 'day' ? [todayDay] : remainingWeekDays();

  const pendingAssignments = (extra.assignments || []).filter(a => daysUntil(a.dueDate) >= 0);

  const weights = new Map<string, { weight: number; reasons: string[] }>();
  const addWeight = (subject: string, w: number, reason: string) => {
    if (!subject) return;
    const entry = weights.get(subject) || { weight: 0, reasons: [] };
    entry.weight += w;
    if (!entry.reasons.includes(reason)) entry.reasons.push(reason);
    weights.set(subject, entry);
  };

  for (const t of data.subjectTopics) {
    if (t.rating === 'needs_improvement' || t.rating === 'average') {
      addWeight(t.subjectName, 2, 'weak topic');
    }
  }

  for (const r of data.academicRecords) {
    if (r.score < 75) addWeight(r.subjectName, 1, `score ${r.score}%`);
  }

  for (const e of data.upcomingExams) {
    const d = daysUntil(e.examDate);
    if (d >= 0 && d <= 14) {
      addWeight(e.subjectName, d <= 3 ? 3 : 2, `exam ${fmtDate(e.examDate)}`);
    }
  }

  for (const a of pendingAssignments) {
    const d = daysUntil(a.dueDate);
    if (d <= 7) addWeight(a.subjectName, 1.5, `assignment due ${fmtDate(a.dueDate)}`);
  }

  for (const t of extra.existingTasks || []) {
    if (t.status !== 'completed') addWeight(t.subjectName, 0.5, 'finish previous tasks');
  }

  for (const r of data.academicRecords) addWeight(r.subjectName, 0.5, 'maintain progress');
  for (const e of data.upcomingExams) addWeight(e.subjectName, 0.5, 'exam preparation');
  for (const a of pendingAssignments) addWeight(a.subjectName, 0.5, 'assignment');

  const sortedSubjects = [...weights.entries()].sort((a, b) => b[1].weight - a[1].weight);
  if (sortedSubjects.length === 0) {
    sortedSubjects.push(['General', { weight: 1, reasons: ['maintain steady progress'] }]);
  }

  const preferredTechnique = data.student.preferredStudyTechnique || 'pomodoro';
  const topicBySubject = new Map<string, string>();
  for (const t of data.subjectTopics) {
    if ((t.rating === 'needs_improvement' || t.rating === 'average') && !topicBySubject.has(t.subjectName)) {
      topicBySubject.set(t.subjectName, t.topicName);
    }
  }

  const tasks: PlanTask[] = [];
  for (let i = 0; i < planDays.length; i++) {
    const day = planDays[i];
    if (day === 'Sunday' && scope === 'week') {
      tasks.push({
        day,
        subjectName: 'General',
        topic: 'Weekly review and rest',
        plannedMinutes: 30,
        studyTechnique: 'light-review',
        reason: 'Light review and recharge before the new week',
      });
      continue;
    }

    for (let j = 0; j < 3; j++) {
      const [subject, meta] = sortedSubjects[(i + j) % sortedSubjects.length];
      const topic = topicBySubject.get(subject) || `${subject} core practice`;
      const boost = Math.max(0, Math.round((meta.weight - 0.5) * 15));
      const minutes = Math.min(120, 45 + boost + (j % 2) * 15);
      tasks.push({
        day,
        subjectName: subject,
        topic,
        plannedMinutes: minutes,
        studyTechnique: preferredTechnique,
        reason: meta.reasons[0] || 'maintain steady progress',
      });
    }
  }

  const focusSubjects = sortedSubjects.slice(0, 5).map(([s]) => s);

  return {
    reasoning: `Planned ${tasks.length} study session(s) for ${scope === 'day' ? 'today' : 'the rest of this week'}, prioritizing ${focusSubjects.join(', ') || 'your subjects'} based on weak topics, exam dates, and assignment deadlines.`,
    focus: focusSubjects.slice(0, 3).map(s => {
      const meta = weights.get(s)!;
      return `Prioritize ${s} (${meta.reasons[0]})`;
    }),
    tasks,
  };
};

export const getAdvisorData = async (userId: string) => {
  const studentId = await resolveStudentId(userId);
  const student = await Student.findById(studentId);
  const user = await User.findById(student?.userId);
  if (!student || !user) throw new Error('Student not found');

  const [academicRecords, sessions, plans, assignments, exams, progressEntries] = await Promise.all([
    AcademicRecord.find({ studentId }).sort({ createdAt: -1 }),
    StudySession.find({ studentId }).sort({ startTime: -1 }),
    StudyPlan.find({ studentId }),
    Assignment.find({ studentId }),
    Exam.find({ studentId }).sort({ examDate: 1 }),
    StudyProgress.find({ studentId }).sort({ completedAt: -1 }),
  ]);

  const now = new Date();

  // Tasks via plans
  const planIds = plans.map(p => p._id);
  const allTasks = await StudyTask.find({ studyPlanId: { $in: planIds } });
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'completed').length;
  const taskRate = totalTasks > 0 ? completedTasks / totalTasks : 0;

  // --- 1. Overall Study Score (0-100) ---
  const avgRecordScore = academicRecords.length > 0
    ? academicRecords.reduce((sum, r: any) => sum + r.score, 0) / academicRecords.length
    : 0;
  const avgFocus = progressEntries.length > 0
    ? progressEntries.reduce((sum: number, p: any) => sum + p.focusScore, 0) / progressEntries.length
    : 0;
  const avgAssignment = assignments.length > 0
    ? assignments.reduce((sum: number, a: any) => sum + (a.marks || 0), 0) / assignments.length
    : 0;
  const completedExams = exams.filter((e: any) => e.preparationLevel >= 100);
  const avgExam = completedExams.length > 0
    ? completedExams.reduce((sum: number, e: any) => sum + (e.preparationLevel || 0), 0) / completedExams.length
    : 0;

  const overallStudyScore = Math.min(100, Math.max(0, Math.round(
    avgRecordScore * 0.25 +
    (avgFocus / 10) * 100 * 0.15 +
    taskRate * 100 * 0.2 +
    avgAssignment * 0.2 +
    avgExam * 0.2
  )));

  // --- 2. Today's Recommendation ---
  let todayRecommendation = 'Great start! Focus on your weak subjects today.';
  if (academicRecords.length > 0 || sessions.length > 0) {
    const prompt = `Give one specific, actionable study recommendation for today (max 100 words) to a student with:
- Average score: ${Math.round(avgRecordScore)}%
- Focus score: ${(avgFocus / 10 * 100).toFixed(0)}%
- Task completion: ${Math.round(taskRate * 100)}%
- Upcoming exams: ${exams.filter((e: any) => new Date(e.examDate) >= now).length}
Keep it brief and encouraging.`;
    const aiResponse = await createChatCompletion(
      [{ role: 'user', content: prompt }],
      { max_tokens: 200 }
    );
    if (aiResponse) todayRecommendation = aiResponse;
  }

  // --- 3. Weak Subjects (3 tiers) ---
  const weakSubjectRecords = academicRecords.filter((r: any) => r.score < 75);
  const tiers = {
    red: weakSubjectRecords.filter((r: any) => r.score < 60).map((r: any) => ({ subjectName: r.subjectName, score: r.score, teacherNotes: r.teacherNotes })),
    yellow: weakSubjectRecords.filter((r: any) => r.score >= 60 && r.score < 75).map((r: any) => ({ subjectName: r.subjectName, score: r.score, teacherNotes: r.teacherNotes })),
    green: academicRecords.filter((r: any) => r.score >= 75).map((r: any) => ({ subjectName: r.subjectName, score: r.score, teacherNotes: r.teacherNotes })),
  };

  // --- 4. Teacher Feedback Summary ---
  const feedbackEntries = academicRecords.filter((r: any) => r.teacherNotes).map((r: any) => ({
    subjectName: r.subjectName,
    feedback: r.teacherNotes,
    score: r.score,
  }));

  // --- 5. Study Habit Analysis ---
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const weekSessions = sessions.filter((s: any) => s.startTime >= weekStart);
  const totalPlannedThisWeek = plans
    .filter((p: any) => p.weekStartDate >= weekStart)
    .reduce((sum: number) => sum, 0);
  // Get planned minutes from tasks that belong to this week's plans
  const weekPlanIds = plans.filter((p: any) => p.weekStartDate >= weekStart).map((p: any) => p._id);
  const weekTasks = allTasks.filter((t: any) => weekPlanIds.some((pid: any) => pid.equals(t.studyPlanId)));
  const plannedMinutes = weekTasks.reduce((sum: number, t: any) => sum + t.plannedMinutes, 0);
  const actualMinutes = weekSessions.reduce((sum: number, s: any) => sum + s.durationMinutes, 0);
  const studyHabitAnalysis = {
    plannedMinutesThisWeek: plannedMinutes,
    actualMinutesThisWeek: Math.round(actualMinutes),
    weeklyAdherence: plannedMinutes > 0 ? Math.round((actualMinutes / plannedMinutes) * 100) : 0,
    totalSessions: sessions.length,
    sessionsThisWeek: weekSessions.length,
    sessionsThisMonth: sessions.filter((s: any) => s.startTime >= monthStart).length,
    averageDailyMinutes: weekSessions.length > 0 ? Math.round(actualMinutes / Math.max(1, weekSessions.length)) : 0,
    consistencyScore: progressEntries.length > 0
      ? Math.round((progressEntries.filter((p: any) => p.focusScore >= 7).length / progressEntries.length) * 100)
      : 0,
  };

  // --- 6. Exam Countdowns ---
  const examCountdowns = exams
    .filter((e: any) => new Date(e.examDate) >= now)
    .map((e: any) => ({
      title: e.subjectName,
      subjectName: e.subjectName,
      date: e.examDate,
      daysRemaining: Math.ceil((new Date(e.examDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      preparationLevel: e.preparationLevel,
    }));

  return {
    overallStudyScore,
    todayRecommendation,
    weakSubjects: tiers,
    teacherFeedback: feedbackEntries,
    studyHabitAnalysis,
    examCountdowns,
  };
};

const fmtDate = (d: Date): string => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const daysUntil = (d: Date): number => Math.ceil((new Date(d).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

const buildStudentContext = async (userId: string): Promise<string> => {
  const student = await Student.findOne({ userId });
  if (!student) throw new Error('Student not found');
  const user = await User.findById(student.userId);
  const studentId = student._id as mongoose.Types.ObjectId;

  const [academicRecords, assignments, exams, plans, sessions, progressEntries] = await Promise.all([
    AcademicRecord.find({ studentId }).sort({ createdAt: -1 }),
    Assignment.find({ studentId }).sort({ dueDate: 1 }).limit(15),
    Exam.find({ studentId }).sort({ examDate: 1 }).limit(20),
    StudyPlan.find({ studentId }).sort({ weekStartDate: -1 }).limit(3),
    StudySession.find({ studentId }).sort({ startTime: -1 }).limit(15),
    StudyProgress.find({ studentId }).sort({ completedAt: -1 }).limit(20),
  ]);

  const subjectTopics = await SubjectTopic.find({
    academicRecordId: { $in: academicRecords.map(r => r._id) },
  }).populate({ path: 'academicRecordId', select: 'subjectName' });

  const planIds = plans.map(p => p._id);
  const tasks = await StudyTask.find({ studyPlanId: { $in: planIds } }).sort({ createdAt: -1 }).limit(30);
  const studyTopics = await StudyTopic.find({
    studyTaskId: { $in: tasks.map(t => t._id) },
  }).sort({ createdAt: -1 }).limit(50);

  const parts: string[] = [];

  parts.push('STUDENT PROFILE');
  parts.push(`- Name: ${user?.name || 'Student'} | Grade: ${student.gradeLevel || 'N/A'} | Section: ${student.section || 'N/A'}`);
  parts.push(`- Learning preference: ${student.learningPreference} | Preferred study time: ${student.preferredStudyTime} | Preferred technique: ${student.preferredStudyTechnique}`);
  parts.push(`- Academic goal: ${student.academicGoal || 'Not set'}`);

  parts.push('ACADEMIC PERFORMANCE');
  if (academicRecords.length === 0) {
    parts.push('- No academic records yet');
  } else {
    for (const r of academicRecords) {
      const attendance = r.totalClasses > 0 ? `${r.attendedClasses}/${r.totalClasses} classes` : 'N/A';
      parts.push(`- ${r.subjectName} (${r.term}): score ${r.score}%, grade ${r.grade} | Attendance: ${attendance}${r.teacherNotes ? ` | Teacher note: "${r.teacherNotes}"` : ''}`);
    }
  }

  parts.push('SUBJECT TOPIC EVALUATIONS');
  if (subjectTopics.length === 0) {
    parts.push('- No topic evaluations yet');
  } else {
    for (const t of subjectTopics) {
      const subject = (t.academicRecordId as unknown as { subjectName?: string })?.subjectName || 'Unknown';
      parts.push(`- ${subject} / ${t.topicName}: ${t.rating}${t.remarks ? ` - "${t.remarks}"` : ''}`);
    }
  }

  parts.push('ASSIGNMENTS');
  const fmtAssignment = (a: IAssignment, status: string) =>
    `- [${status}] ${a.title} (${a.subjectName}) | due ${fmtDate(a.dueDate)}${!a.submitted ? ` (${daysUntil(a.dueDate)} days from now)` : ''} | marks ${a.marks}${a.description ? ` | "${a.description}"` : ''}`;
  if (assignments.length === 0) {
    parts.push('- No assignments yet');
  } else {
    assignments.filter(a => !a.submitted).forEach(a => parts.push(fmtAssignment(a, 'PENDING')));
    assignments.filter(a => a.submitted).slice(0, 5).forEach(a => parts.push(fmtAssignment(a, 'SUBMITTED')));
  }

  parts.push('EXAMS');
  if (exams.length === 0) {
    parts.push('- No exams yet');
  } else {
    for (const e of exams) {
      const d = daysUntil(e.examDate);
      const when = d >= 0 ? `${d} days away` : `${Math.abs(d)} days ago`;
      parts.push(`- ${e.subjectName} (${e.examType}) on ${fmtDate(e.examDate)} (${when}) | preparation ${e.preparationLevel}%`);
    }
  }

  parts.push('STUDY PLANS & TASKS');
  if (plans.length === 0) {
    parts.push('- No study plans yet');
  } else {
    for (const p of plans) {
      const planTasks = tasks.filter(t => t.studyPlanId.toString() === p._id.toString());
      parts.push(`- Plan (${p.status}) started ${fmtDate(p.weekStartDate)} with ${planTasks.length} task(s):`);
      for (const t of planTasks) {
        parts.push(`  * [${t.status}] ${t.day} | ${t.subjectName} | ${t.plannedMinutes}min planned / ${t.studiedMinutes}min studied | ${t.progressPercentage}% done | technique: ${t.studyTechnique}`);
        for (const st of studyTopics.filter(st => st.studyTaskId.toString() === t._id.toString())) {
          parts.push(`    - Topic: ${st.topicName} (${st.progressPercentage}% done)`);
        }
      }
    }
  }

  parts.push('RECENT STUDY SESSIONS');
  if (sessions.length === 0) {
    parts.push('- No study sessions yet');
  } else {
    for (const s of sessions) {
      parts.push(`- ${fmtDate(s.startTime)} | ${s.durationMinutes}min | status: ${s.status}`);
    }
  }

  parts.push('STUDY PROGRESS');
  if (progressEntries.length === 0) {
    parts.push('- No progress entries yet');
  } else {
    for (const p of progressEntries) {
      parts.push(`- ${fmtDate(p.completedAt)}: ${p.actualMinutes}min studied, focus ${p.focusScore}/10${p.notes ? `, notes: "${p.notes}"` : ''}`);
    }
  }

  const avgScore = academicRecords.length > 0
    ? Math.round(academicRecords.reduce((sum, r) => sum + r.score, 0) / academicRecords.length)
    : 0;
  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const avgFocus = progressEntries.length > 0
    ? Math.round(progressEntries.reduce((sum, p) => sum + p.focusScore, 0) / progressEntries.length * 10) / 10
    : 0;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  parts.push('SUMMARY');
  parts.push(`- Average score: ${avgScore}% | Total study time (recent sessions): ${totalMinutes}min | Avg focus: ${avgFocus}/10 | Tasks completed: ${completedTasks}/${totalTasks} (${totalTasks > 0 ? Math.round(completedTasks / totalTasks * 100) : 0}%)`);

  return parts.join('\n');
};

export const askAI = async (
  userId: string,
  question: string,
  history: Array<{ role: 'user' | 'ai'; text: string }> = []
): Promise<{ answer: string; offline: boolean }> => {
  try {
    const context = await buildStudentContext(userId);
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const conversation: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: `You are the student's personal AI study advisor. Today is ${today}. You have full access to the student's real, current data below.

STUDENT DATA:
${context}

Answer the student accurately using ONLY this data. You can answer questions about their assignments, exams, study progress, weak subjects, teacher feedback, study plans, tasks, study sessions, study habits, and anything else in the data. When asked about something not present in the data, say you don't have that information instead of guessing. Compute things like days until an exam or task completion rates from the data. Be concise, practical, and encouraging.` },
    ];

    for (const turn of history.slice(-8)) {
      conversation.push({
        role: turn.role === 'ai' ? 'assistant' : 'user',
        content: turn.text,
      });
    }
    conversation.push({ role: 'user', content: question });

    const aiResponse = await createChatCompletion(conversation, { max_tokens: 700 });
    if (aiResponse) return { answer: aiResponse, offline: false };
    return { answer: 'I was unable to generate a response right now. Please try again in a moment.', offline: true };
  } catch (err) {
    console.error('AI askAI error:', err);
  }

  return { answer: 'You are currently offline. Please check your internet connection and API key configuration.', offline: true };
};
