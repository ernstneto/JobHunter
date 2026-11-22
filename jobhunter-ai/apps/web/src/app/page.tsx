import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="max-w-4xl text-center">
        <h1 className="text-5xl font-bold text-primary-900 mb-4">
          🎯 JobHunter AI
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Intelligent job search, AI-powered CV generation,
          and ATS analysis - all in one place.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <FeatureCard
            icon="🔍"
            title="Smart Search"
            description="Search across 15+ job sources with AI-powered matching"
          />
          <FeatureCard
            icon="📄"
            title="CV Generator"
            description="Generate optimized CVs using multiple AI models"
          />
          <FeatureCard
            icon="📊"
            title="ATS Analyzer"
            description="Get your CV scored by independent AI reviewers"
          />
        </div>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition font-semibold"
          >
            Get Started
          </Link>
          <Link
            href="/jobs"
            className="px-8 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition font-semibold"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );
}