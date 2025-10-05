'use server';

/**
 * @fileOverview A Genkit flow for intelligently grouping related commits together using AI.
 *
 * - intelligentCommitGrouping - A function that handles the commit grouping process.
 * - IntelligentCommitGroupingInput - The input type for the intelligentCommitGrouping function.
 * - IntelligentCommitGroupingOutput - The return type for the intelligentCommitGrouping function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IntelligentCommitGroupingInputSchema = z.object({
  commitList: z
    .string()
    .describe(
      'A list of git commits in the format \"author | date | commit message\"'
    ),
});

export type IntelligentCommitGroupingInput = z.infer<
  typeof IntelligentCommitGroupingInputSchema
>;

const IntelligentCommitGroupingOutputSchema = z.object({
  groupedCommits: z
    .string()
    .describe(
      'A string containing the intelligently grouped commits in a readable format.'
    ),
});

export type IntelligentCommitGroupingOutput = z.infer<
  typeof IntelligentCommitGroupingOutputSchema
>;

export async function intelligentCommitGrouping(
  input: IntelligentCommitGroupingInput
): Promise<IntelligentCommitGroupingOutput> {
  return intelligentCommitGroupingFlow(input);
}

const intelligentCommitGroupingPrompt = ai.definePrompt({
  name: 'intelligentCommitGroupingPrompt',
  input: {schema: IntelligentCommitGroupingInputSchema},
  output: {schema: IntelligentCommitGroupingOutputSchema},
  prompt: `You are an AI assistant that intelligently groups related git commits together.

  Given a list of git commits, analyze the commit messages and timestamps to identify related changes.
  Group these commits into logical groups and provide a summary of each group.

  The input commit list is in the following format: "author | date | commit message"

  Example Input:
  ${'```'}
  John Doe | 2024-01-01T12:00:00Z | Fix: Resolved issue with user authentication
  Jane Smith | 2024-01-01T12:30:00Z | Feat: Implemented password reset functionality
  John Doe | 2024-01-01T13:00:00Z | Fix: Addressed edge case in password reset
  Peter Jones | 2024-01-02T09:00:00Z | Refactor: Code cleanup in user profile module
  Alice Brown | 2024-01-02T10:00:00Z | Docs: Updated documentation for user profile
  ${'```'}

  Example Output:
  ${'```'}
  Group 1: User Authentication and Password Reset (2024-01-01)
  - John Doe: Fix: Resolved issue with user authentication
  - Jane Smith: Feat: Implemented password reset functionality
  - John Doe: Fix: Addressed edge case in password reset

  Group 2: User Profile Module (2024-01-02)
  - Peter Jones: Refactor: Code cleanup in user profile module
  - Alice Brown: Docs: Updated documentation for user profile
  ${'```'}

  Now, group the following commits:
  ${'```'}
  {{{commitList}}}
  ${'```'}`.replace(/  +/g, ' '),
});

const intelligentCommitGroupingFlow = ai.defineFlow(
  {
    name: 'intelligentCommitGroupingFlow',
    inputSchema: IntelligentCommitGroupingInputSchema,
    outputSchema: IntelligentCommitGroupingOutputSchema,
  },
  async input => {
    const {output} = await intelligentCommitGroupingPrompt(input);
    return output!;
  }
);
