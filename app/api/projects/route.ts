import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';

// Schema for validation
const projectSchema = z.object({
  hackathonName: z.string().min(1, 'Hackathon name is required'),
  theme: z.string().min(1, 'Theme is required'),
  duration: z.string().min(1, 'Duration is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  projectIdea: z.string().min(10, 'Project idea should be at least 10 characters'),
  techStack: z.string().min(1, 'Tech stack is required'),
});

export async function POST(request: NextRequest) {
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
    
    // Create a new project in MongoDB
    const project = await Project.create(result.data);
    
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
}

// Get all projects
export async function GET() {
  try {
    // Connect to the database
    await connectToDatabase();
    
    // Fetch all projects, sorted by creation date (newest first)
    const projects = await Project.find({}).sort({ createdAt: -1 });
    
    return NextResponse.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
} 