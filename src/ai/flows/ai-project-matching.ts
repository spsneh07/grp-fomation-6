'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ✅ INPUT: User Profile + List of Projects (with IDs)
const RecommendProjectsInputSchema = z.object({
  userProfile: z.object({
    name: z.string(),
    bio: z.string(),
    skills: z.array(z.string()),
    experienceLevel: z.string(),
  }),
  availableProjects: z.array(z.object({
    id: z.string(), // Critical for mapping back to DB
    title: z.string(),
    description: z.string(),
    techStack: z.array(z.string()),
    type: z.string().optional(),
    teamSize: z.number().optional(),
  })),
});

export type RecommendProjectsInput = z.infer<typeof RecommendProjectsInputSchema>;

// ✅ OUTPUT: Score, Reasoning, and Expert/Learner Tag
const RecommendProjectsOutputSchema = z.object({
  recommendations: z.array(z.object({
    projectId: z.string(), // The ID of the matched project
    matchScore: z.number().describe('0-100 score indicating fit'),
    reasoning: z.string().describe('Short explanation of why this fits'),
    expertOrLearner: z.string().describe('Expert or Learner'),
  }))
});

export const projectMatchingFlow = ai.defineFlow(
  {
    name: 'projectMatchingFlow',
    inputSchema: RecommendProjectsInputSchema,
    outputSchema: RecommendProjectsOutputSchema,
  },
  async (input) => {
    const prompt = await ai.generate({
      prompt: `
        You are an AI Career Matcher.
        
        User Profile:
        - Bio: ${input.userProfile.bio}
        - Skills: ${input.userProfile.skills.join(', ')}
        - Experience: ${input.userProfile.experienceLevel}

        Available Projects:
        ${JSON.stringify(input.availableProjects)}

        Task:
        1. Analyze the fit between the user and each project.
        2. Assign a 'matchScore' (0-100).
        3. Determine 'expertOrLearner':
           - "Expert": User has most required skills.
           - "Learner": User has some skills but needs to learn others.
        4. Write a one-sentence 'reasoning'.
        5. Return a JSON object with a 'recommendations' array containing projectId, matchScore, reasoning, and expertOrLearner.
      `,
      output: { schema: RecommendProjectsOutputSchema },
    });

    return prompt.output!;
  }
);