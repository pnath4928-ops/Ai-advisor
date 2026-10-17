import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, FileText, CalendarCheck, ClipboardList, Users, GraduationCap, BookOpen, Inbox } from 'lucide-react';
import { studentApi } from '@/api/student';
import { populatedName, populatedEmail } from '@/lib/utils';
import { teacherApi } from '@/api/teacher';
import { adminApi } from '@/api/admin';
import { useAuthStore } from '@/store/authStore';

interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  to: string;
  group: string;
}

const iconForGroup = (group: string) => {
  switch (group) {
    case 'Tasks':
      return <FileText className="w-4 h-4 text-text-tertiary" />;
    case 'Study Plans':
      return <CalendarCheck className="w-4 h-4 text-text-tertiary" />;
    case 'Exams':
      return <GraduationCap className="w-4 h-4 text-text-tertiary" />;
    case 'Assignments':
      return <ClipboardList className="w-4 h-4 text-text-tertiary" />;
    case 'Records':
      return <BookOpen className="w-4 h-4 text-text-tertiary" />;
    default:
      return <Users className="w-4 h-4 text-text-tertiary" />;
  }
};

export const GlobalSearch = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [term, setTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [open, setOpen] = useState(false);

  const role = user?.role;
  const active = open && debounced.trim().length > 0;

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(term), 250);
    return () => clearTimeout(handle);
  }, [term]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        !!target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (event.key === '/' && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
      if (event.key === 'Escape') {
        setOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const studentTasks = useQuery({
    queryKey: ['student', 'tasks'],
    queryFn: studentApi.getTasks,
    enabled: active && role === 'student',
  });
  const studentPlans = useQuery({
    queryKey: ['student', 'study-plans'],
    queryFn: studentApi.getStudyPlans,
    enabled: active && role === 'student',
  });
  const studentExams = useQuery({
    queryKey: ['student', 'exams'],
    queryFn: studentApi.getExams,
    enabled: active && role === 'student',
  });
  const studentAssignments = useQuery({
    queryKey: ['student', 'assignments'],
    queryFn: studentApi.getAssignments,
    enabled: active && role === 'student',
  });

  const teacherStudents = useQuery({
    queryKey: ['teacher', 'students'],
    queryFn: teacherApi.getStudents,
    enabled: active && role === 'teacher',
  });
  const teacherAssignments = useQuery({
    queryKey: ['teacher', 'assignments'],
    queryFn: teacherApi.getAssignments,
    enabled: active && role === 'teacher',
  });
  const teacherRecords = useQuery({
    queryKey: ['teacher', 'academicRecords'],
    queryFn: teacherApi.getAcademicRecords,
    enabled: active && role === 'teacher',
  });

  const adminUsers = useQuery({
    queryKey: ['admin', 'users', { search: debounced }],
    queryFn: () => adminApi.getUsers({ search: debounced }),
    enabled: active && role === 'admin',
  });
  const adminTeachers = useQuery({
    queryKey: ['admin', 'teachers', { search: debounced }],
    queryFn: () => adminApi.getTeachers({ search: debounced }),
    enabled: active && role === 'admin',
  });
  const adminStudents = useQuery({
    queryKey: ['admin', 'students', { search: debounced }],
    queryFn: () => adminApi.getStudents({ search: debounced }),
    enabled: active && role === 'admin',
  });

  const results = useMemo<SearchResult[]>(() => {
    const q = debounced.trim().toLowerCase();
    if (!q) return [];
    const match = (value?: string) => !!value && value.toLowerCase().includes(q);
    const out: SearchResult[] = [];

    if (role === 'student') {
      (studentTasks.data || [])
        .filter((t) => match(t.subjectName) || match(t.studyTechnique) || match(t.day))
        .forEach((t) =>
          out.push({
            id: `task-${t._id}`,
            title: t.subjectName,
            subtitle: `${t.day} · ${t.plannedMinutes}min`,
            to: '/dashboard/student/tasks',
            group: 'Tasks',
          })
        );
      (studentPlans.data || [])
        .filter((p) => match(new Date(p.weekStartDate).toLocaleDateString()) || match(p.status))
        .forEach((p) =>
          out.push({
            id: `plan-${p._id}`,
            title: `Week of ${new Date(p.weekStartDate).toLocaleDateString()}`,
            subtitle: p.status,
            to: '/dashboard/student/study-plans',
            group: 'Study Plans',
          })
        );
      (studentExams.data || [])
        .filter((e) => match(e.subjectName) || match(e.examType))
        .forEach((e) =>
          out.push({
            id: `exam-${e._id}`,
            title: e.subjectName,
            subtitle: `${e.examType} · ${new Date(e.examDate).toLocaleDateString()}`,
            to: '/dashboard/student/exams',
            group: 'Exams',
          })
        );
      (studentAssignments.data || [])
        .filter((a) => match(a.title) || match(a.subjectName))
        .forEach((a) =>
          out.push({
            id: `assignment-${a._id}`,
            title: a.title,
            subtitle: a.subjectName,
            to: '/dashboard/student/assignments',
            group: 'Assignments',
          })
        );
    }

    if (role === 'teacher') {
      (teacherStudents.data || [])
        .filter((s) => match(s.studentId) || match(s.gradeLevel) || match(s.section))
        .forEach((s) =>
          out.push({
            id: `student-${s._id}`,
            title: s.studentId,
            subtitle: `Grade ${s.gradeLevel} · Section ${s.section}`,
            to: '/dashboard/teacher/students',
            group: 'Students',
          })
        );
      (teacherAssignments.data || [])
        .filter((a) => match(a.title) || match(a.subjectName))
        .forEach((a) =>
          out.push({
            id: `tassignment-${a._id}`,
            title: a.title,
            subtitle: a.subjectName,
            to: '/dashboard/teacher/assignments',
            group: 'Assignments',
          })
        );
      (teacherRecords.data || [])
        .filter((r) => match(r.subjectName) || match(r.term) || match(r.grade))
        .forEach((r) =>
          out.push({
            id: `record-${r._id}`,
            title: r.subjectName,
            subtitle: `${r.term} · Grade ${r.grade}`,
            to: '/dashboard/teacher/academic-records',
            group: 'Records',
          })
        );
    }

    if (role === 'admin') {
      (adminUsers.data?.users || [])
        .filter((u) => match(u.name) || match(u.email))
        .forEach((u) =>
          out.push({
            id: `user-${u._id}`,
            title: u.name,
            subtitle: `${u.email} · ${u.role}`,
            to: '/dashboard/admin/users',
            group: 'Users',
          })
        );
      (adminTeachers.data?.teachers || []).forEach((t) => {
        const name = populatedName(t.userId, '');
        const email = populatedEmail(t.userId);
        if (match(name) || match(email) || match(t.department)) {
          out.push({
            id: `teacher-${t._id}`,
            title: name || t.teacherId,
            subtitle: t.department,
            to: '/dashboard/admin/teachers',
            group: 'Teachers',
          });
        }
      });
      (adminStudents.data?.students || []).forEach((s) => {
        const name = populatedName(s.userId, '');
        const email = populatedEmail(s.userId);
        if (match(name) || match(email) || match(s.studentId) || match(s.gradeLevel)) {
          out.push({
            id: `astudent-${s._id}`,
            title: name || s.studentId,
            subtitle: `Grade ${s.gradeLevel} · Section ${s.section}`,
            to: '/dashboard/admin/students',
            group: 'Students',
          });
        }
      });
    }

    return out.slice(0, 20);
  }, [
    debounced,
    role,
    studentTasks.data,
    studentPlans.data,
    studentExams.data,
    studentAssignments.data,
    teacherStudents.data,
    teacherAssignments.data,
    teacherRecords.data,
    adminUsers.data,
    adminTeachers.data,
    adminStudents.data,
  ]);

  const isLoading =
    studentTasks.isFetching ||
    studentPlans.isFetching ||
    studentExams.isFetching ||
    studentAssignments.isFetching ||
    teacherStudents.isFetching ||
    teacherAssignments.isFetching ||
    teacherRecords.isFetching ||
    adminUsers.isFetching ||
    adminTeachers.isFetching ||
    adminStudents.isFetching;

  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    for (const result of results) {
      if (!map.has(result.group)) map.set(result.group, []);
      map.get(result.group)!.push(result);
    }
    return [...map.entries()];
  }, [results]);

  const goTo = (result: SearchResult) => {
    setOpen(false);
    setTerm('');
    setDebounced('');
    navigate(result.to);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <motion.div
        className="relative z-50 flex items-center gap-2 bg-surface-secondary border border-border rounded-xl px-3 py-2 transition-colors hover:border-border-hover focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/20"
        animate={{ width: open ? 320 : 256 }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        onFocusCapture={() => setOpen(true)}
      >
        <Search className="w-4 h-4 text-text-tertiary shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search..."
          className="bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none w-full"
        />
        <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] text-text-tertiary bg-surface border border-border rounded-md">
          /
        </kbd>
      </motion.div>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onMouseDown={() => setOpen(false)}
              aria-hidden
            />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-50 mt-2 w-[320px] max-h-80 overflow-y-auto rounded-xl border border-border bg-surface shadow-[0_8px_32px_rgba(0,0,0,0.4)]"
            >
              {debounced.trim().length === 0 ? (
                <p className="p-4 text-xs text-text-tertiary">
                  Type to search tasks, plans, exams, people...
                </p>
              ) : isLoading && results.length === 0 ? (
                <div className="p-4 flex items-center gap-2 text-xs text-text-tertiary">
                  <span className="w-3.5 h-3.5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                  Searching...
                </div>
              ) : results.length === 0 ? (
                <div className="p-4 flex flex-col items-center gap-2 text-text-tertiary">
                  <Inbox className="w-5 h-5" />
                  <p className="text-xs">No matches for "{debounced.trim()}"</p>
                </div>
              ) : (
                grouped.map(([group, items]) => (
                  <div key={group}>
                    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
                      {group}
                    </p>
                    {items.map((result, index) => (
                      <button
                        key={result.id}
                        type="button"
                        onClick={() => goTo(result)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') goTo(result);
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-surface-secondary focus:bg-surface-secondary focus:outline-none ${
                          index === 0 && group === grouped[0][0] ? 'bg-surface-secondary/40' : ''
                        }`}
                      >
                        {iconForGroup(result.group)}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm text-text-primary">
                            {result.title}
                          </span>
                          {result.subtitle && (
                            <span className="block truncate text-xs text-text-tertiary">
                              {result.subtitle}
                            </span>
                          )}
                        </span>
                      </button>
                    ))}
                  </div>
                ))
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
