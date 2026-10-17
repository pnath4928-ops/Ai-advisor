import { useState, useEffect } from 'react';
import { useStudent } from '@/hooks/useStudent';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { useAuthStore } from '@/store/authStore';
import { QueryErrorState } from '@/components/QueryErrorState';
import { User, BookOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/motion/Stagger';
import { fadeUp } from '@/lib/motion';
import { populatedName } from '@/lib/utils';

export const ProfilePage = () => {
  const { user } = useAuthStore();
  const { useProfile, updateProfile } = useStudent();
  const { data: profile, isLoading, isError } = useProfile();

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState({
    gradeLevel: '',
    section: '',
    learningPreference: 'visual' as 'visual' | 'auditory' | 'reading' | 'kinesthetic',
    preferredStudyTime: '',
    preferredStudyTechnique: '',
    academicGoal: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        gradeLevel: profile.gradeLevel,
        section: profile.section,
        learningPreference: profile.learningPreference,
        preferredStudyTime: profile.preferredStudyTime,
        preferredStudyTechnique: profile.preferredStudyTechnique,
        academicGoal: profile.academicGoal,
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile.mutateAsync(formData);
    setIsEditOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-2 text-text-tertiary">
          <span className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardContent>
          <QueryErrorState queryKey={['student', 'profile']} message="We couldn't load your profile." />
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-text-secondary">Profile not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Profile</h1>
          <p className="text-sm text-text-secondary mt-1">Your personal information</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
          <Settings className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  {user?.name || populatedName(profile.userId, '') || profile.studentId}
                </h2>
                <p className="text-sm text-text-secondary">{profile.studentId}</p>
                <p className="text-sm text-text-secondary">Grade {profile.gradeLevel} - Section {profile.section}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant="secondary">{profile.learningPreference}</Badge>
                  <Badge variant="secondary">{profile.preferredStudyTime}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <StaggerContainer className="grid gap-4 grid-cols-1 lg:grid-cols-2" stagger={0.1}>
        <StaggerItem className="h-full">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <CardTitle className="text-sm font-semibold text-text-primary">Academic Details</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Student ID', value: profile.studentId },
                { label: 'Grade Level', value: profile.gradeLevel },
                { label: 'Section', value: profile.section },
                { label: 'Academic Goal', value: profile.academicGoal || 'Not set' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm text-text-primary font-medium">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>

        <StaggerItem className="h-full">
          <Card className="h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-success-subtle">
                  <BookOpen className="w-4 h-4 text-success" />
                </div>
                <CardTitle className="text-sm font-semibold text-text-primary">Study Preferences</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Learning Preference', value: profile.learningPreference, capitalize: true },
                { label: 'Preferred Study Time', value: profile.preferredStudyTime || 'Not set' },
                { label: 'Study Technique', value: profile.preferredStudyTechnique || 'Not set' },
              ].map((item) => (
                <div key={item.label} className="flex justify-between items-center py-2.5 border-b border-border/50 last:border-0">
                  <span className="text-xs text-text-tertiary uppercase tracking-wider">{item.label}</span>
                  <span className="text-sm text-text-primary font-medium capitalize">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </StaggerItem>
      </StaggerContainer>

      {/* Edit Profile Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogClose onClick={() => setIsEditOpen(false)} />
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grade Level</Label>
                <Input value={formData.gradeLevel} onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Section</Label>
                <Input value={formData.section} onChange={(e) => setFormData({ ...formData, section: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Learning Preference</Label>
              <select
                value={formData.learningPreference}
                onChange={(e) => setFormData({ ...formData, learningPreference: e.target.value as 'visual' | 'auditory' | 'reading' | 'kinesthetic' })}
                className="flex h-10 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              >
                <option value="visual">Visual</option>
                <option value="auditory">Auditory</option>
                <option value="reading">Reading</option>
                <option value="kinesthetic">Kinesthetic</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label>Preferred Study Time</Label>
              <Input value={formData.preferredStudyTime} onChange={(e) => setFormData({ ...formData, preferredStudyTime: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Preferred Study Technique</Label>
              <Input value={formData.preferredStudyTechnique} onChange={(e) => setFormData({ ...formData, preferredStudyTechnique: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Academic Goal</Label>
              <textarea
                value={formData.academicGoal}
                onChange={(e) => setFormData({ ...formData, academicGoal: e.target.value })}
                className="flex min-h-[80px] w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
