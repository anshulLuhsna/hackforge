'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

type Project = {
  _id: string;
  hackathonName: string;
  theme: string;
  projectIdea: string;
  techStack: string;
};

export default function GenerateProjectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [projectDescription, setProjectDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  
  // State for existing projects
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  // Fetch existing projects on load
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
        setProjectsError(error instanceof Error ? error.message : 'Failed to load projects');
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  // Find the selected project
  const selectedProject = selectedProjectId ? projects.find(p => p._id === selectedProjectId) : null;

  // Redirect to login if not authenticated
  if (status === 'unauthenticated') {
    router.push('/auth/signin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setGeneratedContent(null);
    
    try {
      const response = await fetch('/api/generate-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          projectDescription,
          referenceProject: selectedProject ? {
            hackathonName: selectedProject.hackathonName,
            theme: selectedProject.theme,
            projectIdea: selectedProject.projectIdea,
            techStack: selectedProject.techStack
          } : null
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to generate project');
      }
      
      setGeneratedContent(data.generatedContent);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to extract code blocks from markdown
  const extractCodeBlocks = (markdown: string) => {
    if (!markdown) return [];
    
    const codeBlockRegex = /```([\w-]+)?\s*\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;
    
    while ((match = codeBlockRegex.exec(markdown)) !== null) {
      const language = match[1] || 'javascript';
      const code = match[2].trim();
      codeBlocks.push({ language, code });
    }
    
    return codeBlocks;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Generate Next.js Project</h1>
      
      {/* Project Description Form */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="projectDescription" className="block text-sm font-medium text-white mb-2">
            Describe Your Project
          </label>
          <textarea
            id="projectDescription"
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project in detail (features, pages, functionality, etc.)"
            rows={6}
            className="w-full px-3 bg-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            Be specific about what you want to build. The more details you provide, the better the generated scaffold will be.
          </p>
        </div>
        
        {/* Project Selection */}
        <div className="mb-6">
          <label htmlFor="referenceProject" className="block text-sm font-medium text-white mb-2">
            Use Existing Project as Reference (Optional)
          </label>
          
          {loadingProjects ? (
            <div className="text-gray-500">Loading projects...</div>
          ) : projectsError ? (
            <div className="text-red-500">{projectsError}</div>
          ) : projects.length === 0 ? (
            <div className="text-gray-500">No existing projects found</div>
          ) : (
            <div>
              <select
                id="referenceProject"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="w-full px-3 bg-black py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select a project --</option>
                {projects.map((project) => (
                  <option key={project._id} value={project._id}>
                    {project.hackathonName}: {project.theme}
                  </option>
                ))}
              </select>
              
              {selectedProject && (
                <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-md">
                  <h3 className="font-semibold text-white mb-2">Selected Project Details:</h3>
                  <p className="text-gray-300"><span className="text-gray-400">Tech Stack:</span> {selectedProject.techStack}</p>
                  <p className="text-gray-300 mt-2"><span className="text-gray-400">Project Idea:</span> {selectedProject.projectIdea.substring(0, 150)}...</p>
                </div>
              )}
            </div>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Selecting a reference project will use its tech stack and description as additional context for generation.
          </p>
        </div>
        
        <button
          type="submit"
          disabled={isLoading || !projectDescription.trim()}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate Project'}
        </button>
      </form>
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
          <p className="text-gray-600">Generating your Next.js project scaffold...</p>
          <p className="text-gray-500 text-sm mt-2">This may take up to a minute</p>
        </div>
      )}
      
      {/* Generated Content */}
      {generatedContent && !isLoading && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Generated Project Scaffold</h2>
          
          {/* Raw content in case no code blocks are detected */}
          {extractCodeBlocks(generatedContent).length === 0 ? (
            <div className="bg-gray-100 p-4 rounded overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap">{generatedContent}</pre>
            </div>
          ) : (
            /* Code blocks if detected */
            <div className="space-y-6">
              {extractCodeBlocks(generatedContent).map((block, index) => (
                <div key={index} className="overflow-hidden rounded-md shadow">
                  <div className="bg-gray-800 text-white px-4 py-2 text-sm flex justify-between items-center">
                    <span>{block.language}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(block.code);
                        alert('Code copied to clipboard!');
                      }}
                      className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
                    >
                      Copy
                    </button>
                  </div>
                  <SyntaxHighlighter
                    language={block.language}
                    style={vscDarkPlus}
                    customStyle={{ margin: 0, maxHeight: 400 }}
                    wrapLines={true}
                    showLineNumbers={true}
                  >
                    {block.code}
                  </SyntaxHighlighter>
                </div>
              ))}
            </div>
          )}
          
          {/* Download as text file button */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                const element = document.createElement('a');
                const file = new Blob([generatedContent], { type: 'text/plain' });
                element.href = URL.createObjectURL(file);
                element.download = 'next-project-scaffold.txt';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Download as Text File
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 