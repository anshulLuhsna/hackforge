'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';

// Define the form schema with Zod
const projectSchema = z.object({
  hackathonName: z.string().min(1, 'Hackathon name is required'),
  theme: z.string().min(1, 'Theme is required'),
  duration: z.string().min(1, 'Duration is required'),
  teamSize: z.string().min(1, 'Team size is required'),
  projectIdea: z.string().min(10, 'Project idea should be at least 10 characters'),
  techStack: z.string().min(1, 'Tech stack is required'),
});

// Infer the type from schema
type ProjectFormValues = z.infer<typeof projectSchema>;

export default function NewProject() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      hackathonName: '',
      theme: '',
      duration: '',
      teamSize: '',
      projectIdea: '',
      techStack: '',
    },
  });

  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to submit project');
      }

      // Redirect to success page or project list
      router.push('/project/success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Submit a New Project</h1>
      
      {submitError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="hackathonName" className="block text-sm font-medium text-white mb-1">
            Hackathon Name
          </label>
          <input
            id="hackathonName"
            type="text"
            {...register('hackathonName')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.hackathonName && (
            <p className="mt-1 text-sm text-red-600">{errors.hackathonName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-white mb-1">
            Theme
          </label>
          <input
            id="theme"
            type="text"
            {...register('theme')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.theme && (
            <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-white mb-1">
            Duration
          </label>
          <select
            id="duration"
            {...register('duration')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select duration</option>
            <option value="24 hours">24 hours</option>
            <option value="36 hours">36 hours</option>
            <option value="48 hours">48 hours</option>
            <option value="72 hours">72 hours</option>
            <option value="1 week">1 week</option>
            <option value="other">Other</option>
          </select>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="teamSize" className="block text-sm font-medium text-white mb-1">
            Team Size
          </label>
          <select
            id="teamSize"
            {...register('teamSize')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select team size</option>
            <option value="1">Solo (1 person)</option>
            <option value="2-3">Small (2-3 people)</option>
            <option value="4-6">Medium (4-6 people)</option>
            <option value="7+">Large (7+ people)</option>
          </select>
          {errors.teamSize && (
            <p className="mt-1 text-sm text-red-600">{errors.teamSize.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="projectIdea" className="block text-sm font-medium text-white mb-1">
            Project Idea
          </label>
          <textarea
            id="projectIdea"
            rows={4}
            {...register('projectIdea')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Describe your project idea..."
          ></textarea>
          {errors.projectIdea && (
            <p className="mt-1 text-sm text-red-600">{errors.projectIdea.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="techStack" className="block text-sm font-medium text-white mb-1">
            Tech Stack
          </label>
          <input
            id="techStack"
            type="text"
            {...register('techStack')}
            className="w-full px-3 py-2 border border-gray-300 bg-black rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="e.g. React, Node.js, MongoDB"
          />
          {errors.techStack && (
            <p className="mt-1 text-sm text-red-600">{errors.techStack.message}</p>
          )}
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Project'}
          </button>
        </div>
      </form>
    </div>
  );
} 