import * as React from 'react';
import * as ProgressPrimitive from '@radix-ui/react-progress';

import { cn } from '@/lib/utils';

interface ProgressSegment {
  value: number;
  className?: string;
}

interface ProgressProps
  extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  segments?: ProgressSegment[];
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value, segments, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-primary/20',
      className
    )}
    {...props}
  >
    {segments ? (
      <div className='flex h-full w-full'>
        {segments.map((segment, index) => (
          <div
            key={index}
            className={cn('h-full transition-all', segment.className)}
            style={{ width: `${segment.value}%` }}
          />
        ))}
      </div>
    ) : (
      <ProgressPrimitive.Indicator
        className='h-full w-full flex-1 bg-primary transition-all'
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    )}
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
