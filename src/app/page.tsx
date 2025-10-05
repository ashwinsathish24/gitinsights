import { GitProcessor } from '@/components/GitProcessor';
import { Code, GitCommitHorizontal } from 'lucide-react';

export default function Home() {
  const gitCommand = 'git log --pretty=format:"%an | %ad | %s" --date=iso';

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary flex items-center justify-center gap-4">
          <GitCommitHorizontal className="w-10 h-10" />
          Git Insights Excelerator
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Group your Git commits locally and export them to CSV.
        </p>
      </header>
      <section className="max-w-4xl mx-auto bg-card p-6 rounded-lg shadow-md mb-8">
        <h2 className="font-headline text-2xl font-bold mb-2">How to Use</h2>
        <p className="mb-4 text-card-foreground">
          1. Navigate to your Git repository's directory in your terminal.
        </p>
        <p className="mb-4 text-card-foreground">
          2. Run the following command to copy your commit history:
        </p>
        <div className="bg-muted p-4 rounded-md text-muted-foreground font-code text-sm overflow-x-auto flex items-center gap-2">
          <Code className="w-4 h-4 flex-shrink-0" />
          <span>{gitCommand}</span>
        </div>
        <p className="mt-4 text-card-foreground">
          3. Paste the copied log into the text area below and click "Group Commits".
        </p>
      </section>
      <GitProcessor />
    </main>
  );
}
