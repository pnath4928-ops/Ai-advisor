import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export const UnauthorizedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold text-text-primary">Access denied</h1>
          <p className="text-sm text-text-secondary">
            Your account does not have permission to view this page.
          </p>
          <Link to="/dashboard" className={buttonVariants()}>
            Back to dashboard
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};
