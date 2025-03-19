import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Project from '@/models/Project';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// This is a protected admin API route to migrate existing projects
// to have a userId assigned to them. It should only be run once.
export async function POST(request: NextRequest) {
  try {
    // Get current user from session
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Only allow a specific admin email to run this migration
    // Replace with the actual admin email
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    if (session.user.email !== adminEmail) {
      return NextResponse.json(
        { error: 'Forbidden - Only admin can run migrations' },
        { status: 403 }
      );
    }
    
    // Parse the admin ID from the request
    const body = await request.json();
    const { adminId } = body;
    
    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find all projects that don't have a userId
    const projects = await Project.find({ userId: { $exists: false } });
    
    // Update each project to have the admin's ID
    for (const project of projects) {
      project.userId = adminId;
      await project.save();
    }
    
    return NextResponse.json({
      success: true,
      message: `Updated ${projects.length} projects to have admin ID`,
      count: projects.length
    });
  } catch (error) {
    console.error('Error during migration:', error);
    
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 