import csv
from datetime import datetime

KEYWORD_GROUPS = {
    'Authentication & Users': ['auth', 'user', 'login', 'password', 'register', 'profile'],
    'Features': ['feat', 'implement', 'add', 'create'],
    'Bug Fixes': ['fix', 'bug', 'resolve', 'issue', 'hotfix'],
    'Refactoring & Style': ['refactor', 'style', 'cleanup', 'lint'],
    'Documentation': ['docs', 'readme', 'documentation'],
    'Build & CI/CD': ['build', 'ci', 'cd', 'deploy', 'release'],
    'Testing': ['test', 'spec', 'snapshot'],
}

def get_group_title(message):
    lower_message = message.lower()
    for title, keywords in KEYWORD_GROUPS.items():
        if any(keyword in lower_message for keyword in keywords):
            return title
    return 'Miscellaneous'

def group_commits(raw_text):
    if not raw_text.strip():
        return []

    lines = raw_text.strip().split('\n')
    raw_commits = []
    for line in lines:
        parts = line.split('|')
        if len(parts) < 3:
            continue
        try:
            date = datetime.fromisoformat(parts[1].strip()).strftime('%Y-%m-%d')
            raw_commits.append({
                'author': parts[0].strip(),
                'date': date,
                'message': '|'.join(parts[2:]).strip(),
            })
        except ValueError:
            continue

    grouped_by_date_and_title = {}

    for commit in raw_commits:
        group_title = get_group_title(commit['message'])
        date = commit['date']

        if date not in grouped_by_date_and_title:
            grouped_by_date_and_title[date] = {}
        if group_title not in grouped_by_date_and_title[date]:
            grouped_by_date_and_title[date][group_title] = []
        grouped_by_date_and_title[date][group_title].append(commit)

    final_groups = []
    group_id = 1
    for date in sorted(grouped_by_date_and_title.keys(), reverse=True):
        for title in grouped_by_date_and_title[date]:
            final_groups.append({
                'id': f'group-{group_id}',
                'title': title,
                'date': date,
                'commits': [{
                    'author': c['author'],
                    'message': c['message']
                } for c in grouped_by_date_and_title[date][title]]
            })
            group_id += 1

    return final_groups

def download_csv(groups, file_path):
    with open(file_path, 'w', newline='', encoding='utf-8') as csvfile:
        csv_writer = csv.writer(csvfile)
        csv_writer.writerow(['Group Title', 'Group Date', 'Author', 'Commit Message'])

        for group in groups:
            for commit in group['commits']:
                csv_writer.writerow([
                    group['title'],
                    group['date'],
                    commit['author'],
                    commit['message'],
                ])