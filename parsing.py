import csv
from datetime import datetime

KEYWORD_GROUPS = {
    'Authentication & Users': ['auth', 'user', 'login', 'password', 'register', 'profile', 'btrl', 'license'],
    'Features': ['feat', 'implement', 'add', 'create', 'added'],
    'Bug Fixes': ['fix', 'bug', 'resolve', 'issue', 'hotfix'],
    'Refactoring & Style': ['refactor', 'style', 'cleanup', 'lint'],
    'Documentation': ['docs', 'documentation'], # Removed 'readme' to avoid conflict with exclusion
    'Build & CI/CD': ['build', 'ci', 'cd', 'deploy', 'release'],
    'Testing': ['test', 'spec', 'snapshot'],
}

def get_group_title(message):
    """Assigns a group title to a commit message based on keywords."""
    lower_message = message.lower()
    for title, keywords in KEYWORD_GROUPS.items():
        if any(keyword in lower_message for keyword in keywords):
            return title
    return 'Features' # Default to 'Features' if no other category matches

def group_commits(raw_text):
    """Parses raw git log text, filters it, and groups commits."""
    if not raw_text.strip():
        return []

    lines = raw_text.strip().split('\n')
    all_commits = []
    # Words to exclude from commit messages (case-insensitive)
    exclude_keywords = {"github", "commit", "branch", "readme", "__pycache__", "yml", "pyinstaller"}
    
    for line in lines:
        parts = line.split('|')
        if len(parts) < 3:
            continue
        try:
            author = parts[0].strip()
            # Exclude GitHub Actions bot
            if author.lower() == "github-actions[bot]":
                continue

            date = datetime.fromisoformat(parts[1].strip()).strftime('%Y-%m-%d')
            message = '|'.join(parts[2:]).strip()
            lower_message = message.lower()
            
            # Exclude merge commits and messages with specific keywords
            if lower_message.startswith('merge ') or any(keyword in lower_message for keyword in exclude_keywords):
                continue
                
            group_title = get_group_title(message)
            
            all_commits.append({
                'title': group_title,
                'date': date,
                'message': message,
            })
        except ValueError:
            # Skip lines that don't parse correctly
            continue

    return all_commits

def download_csv(commits, file_path):
    """Writes the list of commits to a CSV file."""
    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['S.No.', 'Group Title', 'Group Date', 'Commit Message'])

        for i, commit in enumerate(commits):
            csv_writer.writerow([
                i + 1,
                commit['title'],
                commit['date'],
                commit['message'],
            ])