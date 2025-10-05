export interface RawCommit {
  author: string;
  date: string;
  message: string;
}

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

const KEYWORD_GROUPS: Record<string, string[]> = {
  'Authentication & Users': ['auth', 'user', 'login', 'password', 'register', 'profile'],
  'Features': ['feat', 'implement', 'add', 'create'],
  'Bug Fixes': ['fix', 'bug', 'resolve', 'issue', 'hotfix'],
  'Refactoring & Style': ['refactor', 'style', 'cleanup', 'lint'],
  'Documentation': ['docs', 'readme', 'documentation'],
  'Build & CI/CD': ['build', 'ci', 'cd', 'deploy', 'release'],
  'Testing': ['test', 'spec', 'snapshot'],
};

function getGroupTitle(message: string): string {
  const lowerMessage = message.toLowerCase();
  for (const title in KEYWORD_GROUPS) {
    if (KEYWORD_GROUPS[title].some(keyword => lowerMessage.includes(keyword))) {
      return title;
    }
  }
  return 'Miscellaneous';
}


export function groupCommits(rawText: string): CommitGroup[] {
  if (!rawText.trim()) return [];

  const lines = rawText.trim().split('\n');
  const rawCommits: RawCommit[] = lines.map(line => {
    const parts = line.split('|');
    if (parts.length < 3) return null;
    return {
      author: parts[0].trim(),
      date: new Date(parts[1].trim()).toISOString().split('T')[0], // YYYY-MM-DD
      message: parts.slice(2).join('|').trim(),
    };
  }).filter((c): c is RawCommit => c !== null);

  const groupedByDateAndTitle: Record<string, Record<string, RawCommit[]>> = {};

  rawCommits.forEach(commit => {
    const groupTitle = getGroupTitle(commit.message);
    const date = commit.date;
    
    if (!groupedByDateAndTitle[date]) {
      groupedByDateAndTitle[date] = {};
    }
    if (!groupedByDateAndTitle[date][groupTitle]) {
      groupedByDateAndTitle[date][groupTitle] = [];
    }
    groupedByDateAndTitle[date][groupTitle].push(commit);
  });
  
  const finalGroups: CommitGroup[] = [];
  let groupId = 1;

  Object.keys(groupedByDateAndTitle).sort().reverse().forEach(date => {
    const titles = Object.keys(groupedByDateAndTitle[date]);
    titles.forEach(title => {
      finalGroups.push({
        id: `group-${groupId++}`,
        title: title,
        date: date,
        commits: groupedByDateAndTitle[date][title].map(c => ({
          author: c.author,
          message: c.message
        }))
      });
    });
  });

  return finalGroups;
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
