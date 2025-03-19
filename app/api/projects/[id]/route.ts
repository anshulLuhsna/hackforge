import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/models/Project';
import { withAuth, AuthenticatedUser } from '@/lib/auth-middleware';

// Delete a project by ID
export const DELETE = withAuth(async (
  request: NextRequest, 
  user: AuthenticatedUser, 
  { params }: { params: { id: string } }
) => {
  try {
    await connectDB();
    
    const projectId = params.id;
    
    // Find the project first to verify ownership
    const project = await Project.findById(projectId);
    
    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Check if the current user owns this project
    if (project.userId !== user.email) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this project' },
        { status: 403 }
      );
    }
    
    // Delete the project
    await Project.findByIdAndDelete(projectId);
    
    return NextResponse.json(
      { message: 'Project deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { error: 'Failed to delete project' },
      { status: 500 }
    );
  }
});
