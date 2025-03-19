import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedUser } from '@/lib/auth-middleware';

// Schema for validation
const projectSchema = z.object({
  hackathonName: z.string().min(1, 'Hackathon name is required'),
  theme: z.string().min(1, 'Theme is required'),
  duration: z.string().min(1, 'Duration is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  projectIdea: z.string().min(10, 'Project idea should be at least 10 characters'),
  techStack: z.string().min(1, 'Tech stack is required'),
});

// Create a new project
export const POST = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Parse the request body
    const body = await request.json();
    
    // Validate the input
    const result = projectSchema.safeParse(body);
    
    if (!result.success) {
      // Return validation errors
      return NextResponse.json(
        { error: 'Validation failed', details: result.error.format() },
        { status: 400 }
      );
    }
    
    // Add the user ID to the project data
    const projectData = {
      ...result.data,
      userId: user.email, // Use email as userId since it's unique
    };
    
    // Create a new project in MongoDB
    const project = await Project.create(projectData);
    
    // Return success response with the created project
    return NextResponse.json(
      { success: true, message: 'Project submitted successfully', project },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error handling project submission:', error);
    
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
});

// Get all projects for the current user
export const GET = withAuth(async (request: NextRequest, user: AuthenticatedUser) => {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Fetch only projects for the current user, sorted by creation date (newest first)
    const projects = await Project.find({ userId: user.email }).sort({ createdAt: -1 });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}); 