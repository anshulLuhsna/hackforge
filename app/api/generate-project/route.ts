import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import openai from '@/lib/openai';
import { z } from 'zod';

// Schema for reference project
const referenceProjectSchema = z.object({
  hackathonName: z.string(),
  theme: z.string(),
  projectIdea: z.string(),
  techStack: z.string()
}).nullable().optional();

// Schema for validating the request body
const requestSchema = z.object({
  projectDescription: z.string().min(10, 'Project description must be at least 10 characters long'),
  referenceProject: referenceProjectSchema
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = requestSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { projectDescription, referenceProject } = validationResult.data;

    // Construct the prompt for OpenAI
    let prompt = `Generate a complete Next.js project scaffold based on the following description:
    
${projectDescription}

`;

    // Add reference project details if provided
    if (referenceProject) {
      prompt += `
Please use the following existing project as reference:
- Hackathon Name: ${referenceProject.hackathonName}
- Theme: ${referenceProject.theme}
- Project Idea: ${referenceProject.projectIdea}
- Tech Stack: ${referenceProject.techStack}

The tech stack mentioned above should be incorporated into the new project scaffold where applicable.
`;
    }

    prompt += `
Your response should include:
1. A comprehensive folder structure for a Next.js project
2. Key files with complete code (e.g., pages, components, API routes)
3. Installation and setup instructions
4. Required dependencies
5. Explanation of the architecture and how components interact

The code should be production-ready, well-structured, and follow best practices for Next.js. 
Include TypeScript types, proper error handling, and comments explaining complex logic.
Format your response as valid code blocks that can be directly copied and used.`;

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert Next.js developer. Generate complete, production-ready Next.js project scaffolds based on user descriptions. Include all necessary files, code, and setup instructions.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 4000,
    });

    // Get response content
    const generatedContent = completion.choices[0]?.message?.content || '';
    
    // Return the generated code
    return NextResponse.json({ 
      success: true, 
      generatedContent
    });
    
  } catch (error) {
    console.error('Error generating project:', error);
    
    return NextResponse.json(
      { error: 'Failed to generate project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 