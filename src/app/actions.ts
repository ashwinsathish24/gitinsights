
'use server';

import { intelligentCommitGrouping } from '@/ai/flows/intelligent-commit-grouping';

export async function groupCommitsAction(commitList: string): Promise<{ data?: string; error?: string }> {
  if (!commitList.trim()) {
    return { error: 'Commit log cannot be empty.' };
  }
  
  try {
    const result = await intelligentCommitGrouping({ commitList });
    return { data: result.groupedCommits };
  } catch (e) {
    console.error(e);
    if (e instanceof Error) {
        return { error: 'Failed to group commits due to an AI service error. Please try again later.' };
    }
    return { error: 'An unknown error occurred while grouping commits.' };
  }
}
