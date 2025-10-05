'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Layers, Zap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { groupCommits, type CommitGroup } from '@/lib/parsing';
import { ResultsDisplay } from './ResultsDisplay';

const FormSchema = z.object({
  commitLog: z.string().min(10, {
    message: 'Commit log must be at least 10 characters.',
  }),
});

export function GitProcessor() {
  const [groupedCommits, setGroupedCommits] = useState<CommitGroup[] | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { commitLog: '' },
  });

  function onSubmit(data: z.infer<typeof FormSchema>) {
    setGroupedCommits(null);

    const parsedData = groupCommits(data.commitLog);
    
    if (parsedData.length === 0) {
      toast({
        variant: 'destructive',
        title: 'No Groups Found',
        description: 'Could not group any commits. Check your commit log format.',
      });
    } else {
      setGroupedCommits(parsedData);
      toast({
        title: 'Success!',
        description: 'Your commits have been grouped.',
      });
    }
  }

  return (
    <>
      <section className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-md mb-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="commitLog"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl font-bold font-headline">Paste Git Log Below</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., John Doe | 2024-01-01T12:00:00+0000 | Fix: Resolved issue..."
                      className="min-h-[200px] font-code text-sm"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Layers className="mr-2 h-4 w-4" />
              Group Commits
            </Button>
          </form>
        </Form>
      </section>

      {groupedCommits && <ResultsDisplay groups={groupedCommits} />}
    </>
  );
}
