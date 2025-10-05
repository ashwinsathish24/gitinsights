'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { type CommitGroup, downloadCsv } from '@/lib/parsing';
import { Download, Layers, User, FileText, Calendar } from 'lucide-react';
import { Badge } from './ui/badge';

interface ResultsDisplayProps {
  groups: CommitGroup[];
}

export function ResultsDisplay({ groups }: ResultsDisplayProps) {
  if (!groups || groups.length === 0) {
    return null;
  }
  
  const handleDownload = () => {
    downloadCsv(groups);
  };

  return (
    <section className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
            <h2 className="font-headline text-3xl font-bold text-primary">Grouped Commits</h2>
            <Button onClick={handleDownload} className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="mr-2 h-4 w-4" />
                Download CSV
            </Button>
        </div>
        <Accordion type="multiple" className="w-full bg-card rounded-lg shadow-md p-2 space-y-2">
            {groups.map((group) => (
                <AccordionItem value={group.id} key={group.id} className="border-b-0 bg-background rounded-md">
                    <AccordionTrigger className="p-4 hover:no-underline rounded-md hover:bg-muted/50 text-left">
                        <div className="flex items-center gap-4 w-full">
                            <Layers className="h-6 w-6 text-accent flex-shrink-0" />
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg font-headline">{group.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                    <Calendar className="h-4 w-4" />
                                    {group.date}
                                </p>
                            </div>
                            <Badge variant="secondary" className="ml-auto hidden sm:inline-flex">{group.commits.length} commits</Badge>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="p-4 pt-0">
                        <ul className="space-y-3">
                            {group.commits.map((commit, index) => (
                                <li key={index} className="flex flex-col sm:flex-row gap-x-4 gap-y-2 p-3 rounded-md border bg-card">
                                    <div className="flex items-center gap-2 text-sm font-medium shrink-0 w-full sm:w-48 text-primary">
                                        <User className="h-4 w-4 text-accent" />
                                        <span>{commit.author}</span>
                                    </div>
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground flex-1">
                                        <FileText className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                        <p>{commit.message}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    </section>
  );
}
