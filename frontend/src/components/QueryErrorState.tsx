import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface QueryErrorStateProps {
  queryKey: readonly unknown[];
  message?: string;
  colSpan?: number;
  className?: string;
}

export const QueryErrorState = ({
  queryKey,
  message = "We couldn't load this data.",
  colSpan,
  className,
}: QueryErrorStateProps) => {
  const queryClient = useQueryClient();

  const content = (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <AlertTriangle className="w-5 h-5 text-danger" />
      <p className="text-sm text-text-secondary">{message}</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => queryClient.invalidateQueries({ queryKey })}
      >
        Try again
      </Button>
    </div>
  );

  if (colSpan !== undefined) {
    return (
      <tr>
        <td colSpan={colSpan} className="p-4 text-center">
          {content}
        </td>
      </tr>
    );
  }

  return <div className={className}>{content}</div>;
};
