'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Project = {
  _id: string;
  hackathonName: string;
  theme: string;
  duration: string;
  teamSize: string;
  projectIdea: string;
  techStack: string;
  createdAt: string;
};

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        
        if (!response.ok) {
          throw new Error('Failed to fetch projects');
        }
        
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);


  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects/${projectToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete project');
      }

      // Remove deleted project from state
      setProjects(projects.filter(project => project._id !== projectToDelete));
      setDeleteModal(false);
      setProjectToDelete(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete project');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setProjectToDelete(null);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Link
          href="/project/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Submit New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 text-lg">No projects found. Be the first to submit one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-2">{project.hackathonName}</h2>
                <p className="text-gray-600 mb-4">Theme: {project.theme}</p>
                <div className="mb-4">
                  <p className="text-gray-700 font-semibold">Project Idea:</p>
                  <p className="text-gray-600">{project.projectIdea.length > 100 ? `${project.projectIdea.substring(0, 100)}...` : project.projectIdea}</p>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Team: {project.teamSize}</span>
                  <span>Duration: {project.duration}</span>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700">Tech Stack:</p>
                  <p className="text-sm text-gray-600">{project.techStack}</p>
                </div>
                <div className="mt-4 text-xs text-gray-400">
                  Submitted on {new Date(project.createdAt).toLocaleDateString()}
                </div>
                <div className="mt-4 flex justify-end space-x-2">
                 
                  <button 
                    onClick={() => handleDeleteClick(project._id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Confirm Delete</h3>
            <p className="mb-6">Are you sure you want to delete this project? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleDeleteCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}