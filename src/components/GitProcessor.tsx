'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Zap } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { groupCommitsAction } from '@/app/actions';
import { parseGroupedCommits, type CommitGroup } from '@/lib/parsing';
import { ResultsDisplay } from './ResultsDisplay';

const FormSchema = z.object({
  commitLog: z.string().min(10, {
    message: 'Commit log must be at least 10 characters.',
  }),
});

export function GitProcessor() {
  const [groupedCommits, setGroupedCommits] = useState<CommitGroup[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: { commitLog: '' },
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    setIsSubmitting(true);
    setGroupedCommits(null);

    const result = await groupCommitsAction(data.commitLog);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: result.error,
      });
    } else if (result.data) {
      const parsedData = parseGroupedCommits(result.data);
      if (parsedData.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Parsing Error',
          description: 'Could not parse the AI response. The format might be unexpected or no groups were found.',
        });
      } else {
        setGroupedCommits(parsedData);
        toast({
          title: 'Success!',
          description: 'Your commits have been grouped.',
        });
      }
    } else {
      toast({
        variant: 'destructive',
        title: 'An error occurred',
        description: 'Received an empty response from the server.',
      });
    }

    setIsSubmitting(false);
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
            <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Zap className="mr-2 h-4 w-4" />
              )}
              {isSubmitting ? 'Grouping...' : 'Group Commits'}
            </Button>
          </form>
        </Form>
      </section>

      {isSubmitting && (
        <div className="flex justify-center items-center my-12 flex-col gap-4 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div >
                <p className="font-semibold text-lg">AI is thinking...</p>
                <p className="text-muted-foreground">Please wait while we group your commits.</p>
            </div>
        </div>
      )}

      {groupedCommits && <ResultsDisplay groups={groupedCommits} />}
    </>
  );
}
