/* eslint-disable */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import AdmZip from 'adm-zip';
import { join } from 'path';
import Project from '@/models/Project';
import connectToDatabase from '@/lib/mongodb';
import jwt from 'jsonwebtoken';

// Secret key for verifying CLI JWT tokens
const CLI_TOKEN_SECRET = process.env.CLI_TOKEN_SECRET || 'hackforge-cli-secret-key';

/**
 * API endpoint to download a project scaffold as a ZIP file
 * GET /api/projects/:id/download
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check for CLI token in Authorization header
    const authHeader = request.headers.get('Authorization');
    let isAuthenticated = false;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        // Verify the CLI token
        jwt.verify(token, CLI_TOKEN_SECRET);
        isAuthenticated = true;
      } catch (tokenError) {
        console.error('Invalid CLI token:', tokenError);
      }
    }
    
    // If no CLI token, check for NextAuth session
    if (!isAuthenticated) {
      const session = await getServerSession(authOptions);
      if (session) {
        isAuthenticated = true;
      }
    }
    
    // Return error if not authenticated
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication token expired or invalid.' },
        { status: 401 }
      );
    }

    // Get project ID from params
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find the project
    const project = await Project.findById(id);

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Create a new ZIP file
    const zip = new AdmZip();
    
    // Create package.json
    const packageJson: {
      name: string;
      version: string;
      private: boolean;
      scripts: { [key: string]: string };
      dependencies: { [key: string]: string };
      devDependencies: { [key: string]: string };
    } = {
      name: project.hackathonName.toLowerCase().replace(/\s+/g, '-'),
      version: '0.1.0',
      private: true,
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
        lint: 'next lint'
      },
      dependencies: {
        next: '^14.0.0',
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        typescript: '^5.2.2',
        '@types/node': '^20.8.10',
        '@types/react': '^18.2.36',
        '@types/react-dom': '^18.2.14'
      }
    };
    
    // Add tech stack from project
    interface Project {
      hackathonName: string;
      theme: string;
      projectIdea: string;
      techStack: string;
    }

    const techStackItems: string[] = project.techStack.split(',').map((item: string) => item.trim());
    
    // Add dependencies based on tech stack
    techStackItems.forEach(tech => {
      const lowerTech = tech.toLowerCase();
      
      if (lowerTech.includes('tailwind')) {
        packageJson.dependencies['tailwindcss'] = '^3.3.5';
        packageJson.dependencies['postcss'] = '^8.4.31';
        packageJson.dependencies['autoprefixer'] = '^10.4.16';
      }
      
      if (lowerTech.includes('mongodb') || lowerTech.includes('mongo')) {
        packageJson.dependencies['mongoose'] = '^7.6.3';
      }
      
      if (lowerTech.includes('auth') || lowerTech.includes('nextauth')) {
        packageJson.dependencies['next-auth'] = '^4.24.4';
      }
    });
    
    // Add files to the ZIP
    zip.addFile('package.json', Buffer.from(JSON.stringify(packageJson, null, 2)));
    
    // Add README.md with project information
    const readmeContent = `# ${project.hackathonName}

${project.theme}

## Project Idea

${project.projectIdea}

## Tech Stack

${project.techStack}

## Getting Started

First, install the dependencies:

\`\`\`bash
npm install
# or
yarn
\`\`\`

Then, run the development server:

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
`;
    
    zip.addFile('README.md', Buffer.from(readmeContent));
    
    // Add basic Next.js structure
    zip.addFile('next.config.js', Buffer.from(`/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig
`));
    
    zip.addFile('tsconfig.json', Buffer.from(`{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
`));
    
    // Add app directory structure
    zip.addFile('app/page.tsx', Buffer.from(`export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold">${project.hackathonName}</h1>
      <p className="text-xl">${project.theme}</p>
    </main>
  )
}
`));
    
    zip.addFile('app/layout.tsx', Buffer.from(`import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: '${project.hackathonName}',
  description: '${project.theme}',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
`));
    
    zip.addFile('app/globals.css', Buffer.from(`@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --foreground-rgb: 0, 0, 0;
  --background-start-rgb: 214, 219, 220;
  --background-end-rgb: 255, 255, 255;
}

@media (prefers-color-scheme: dark) {
  :root {
    --foreground-rgb: 255, 255, 255;
    --background-start-rgb: 0, 0, 0;
    --background-end-rgb: 0, 0, 0;
  }
}

body {
  color: rgb(var(--foreground-rgb));
  background: linear-gradient(
      to bottom,
      transparent,
      rgb(var(--background-end-rgb))
    )
    rgb(var(--background-start-rgb));
}
`));
    
    // Add tailwind config if in tech stack
    if (techStackItems.some(tech => tech.toLowerCase().includes('tailwind'))) {
      zip.addFile('tailwind.config.js', Buffer.from(`/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
`));
      
      zip.addFile('postcss.config.js', Buffer.from(`module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`));
    }
    
    // Add MongoDB connection if in tech stack
    if (techStackItems.some(tech => tech.toLowerCase().includes('mongodb') || tech.toLowerCase().includes('mongo'))) {
      zip.addFile('lib/mongodb.ts', Buffer.from(`import mongoose from 'mongoose';

// Define the mongoose connection cache structure
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add mongoose property to global type
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
  cached = global.mongoose;
}

async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
`));
    }
    
    // Add .env.local template
    let envContent = `# Environment Variables
`;
    
    if (techStackItems.some(tech => tech.toLowerCase().includes('mongodb') || tech.toLowerCase().includes('mongo'))) {
      envContent += `\n# MongoDB
MONGODB_URI=your_mongodb_connection_string
`;
    }
    
    if (techStackItems.some(tech => tech.toLowerCase().includes('auth') || tech.toLowerCase().includes('nextauth'))) {
      envContent += `\n# NextAuth.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Add your OAuth providers here
# GITHUB_ID=
# GITHUB_SECRET=
# GOOGLE_ID=
# GOOGLE_SECRET=
`;
    }
    
    zip.addFile('.env.local.example', Buffer.from(envContent));
    
    // Get the ZIP file as buffer
    const zipBuffer = zip.toBuffer();
    
    // Set the response headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${project.hackathonName.toLowerCase().replace(/\s+/g, '-')}.zip"`);
    
    // Return the ZIP file
    return new Response(zipBuffer, {
      status: 200,
      headers
    });
    
  } catch (error) {
    console.error('Error downloading project:', error);
    
    return NextResponse.json(
      { error: 'Failed to download project', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}