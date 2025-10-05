export interface Commit {
  author: string;
  message: string;
}

export interface CommitGroup {
  id: string;
  title: string;
  date: string;
  commits: Commit[];
}

export function parseGroupedCommits(rawText: string): CommitGroup[] {
  const groups: CommitGroup[] = [];
  if (!rawText) return groups;
  
  const groupBlocks = rawText.trim().split(/\n\s*\n/);

  groupBlocks.forEach((block, index) => {
    const lines = block.trim().split('\n');
    const headerLine = lines.shift();
    if (!headerLine) return;

    const headerMatch = headerLine.match(/^Group \d+:\s*(.*?)\s*\(([\d-]{10}[^)]*)\)/);
    const title = headerMatch ? headerMatch[1].trim() : `Group ${index + 1}`;
    const date = headerMatch ? headerMatch[2].trim() : 'N/A';

    const commits: Commit[] = lines.map(line => {
      const commitMatch = line.match(/-\s*([^:]+):\s*(.*)/);
      if (commitMatch) {
        return {
          author: commitMatch[1].trim(),
          message: commitMatch[2].trim(),
        };
      }
      return { author: 'N/A', message: line.replace(/-\s*/, '').trim() };
    }).filter(c => c.message);

    if (commits.length > 0) {
      groups.push({
        id: `group-${index + 1}`,
        title,
        date,
        commits
      });
    }
  });

  return groups;
}

function escapeCsvField(field: string): string {
    return `"${field.replace(/"/g, '""')}"`;
}

export function downloadCsv(groups: CommitGroup[]) {
  const csvRows = [
    ['Group Title', 'Group Date', 'Author', 'Commit Message']
  ];

  groups.forEach(group => {
    group.commits.forEach(commit => {
      csvRows.push([
        escapeCsvField(group.title),
        escapeCsvField(group.date),
        escapeCsvField(commit.author),
        escapeCsvField(commit.message),
      ]);
    });
  });

  const csvString = csvRows.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', 'grouped_commits.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
