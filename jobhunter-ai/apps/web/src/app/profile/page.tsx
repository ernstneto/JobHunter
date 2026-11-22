"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useProfile } from "@/lib/ProfileContext";
import { isAuthenticated, logout } from "@/lib/auth";
import axios from "axios";

export default function ProfilePage() {
    const router = useRouter();
    const { profile, setProfile } = useProfile();

    const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [saveMessage, setMessage] = useState("");

    // Redirecionar se nao estiver logado
    if (typeof window !== "undefined" && !isAuthenticated()) {
        router.push("/login");
        return null;
    }

    const handleLinkedInUpload = async () => {
        if (!linkedinFile) return;
        setParsing(true);

        const formData = new FormData();
        formData.append("file", linkedinFile);

        try {
            // Chama o AI Service (8000) diretamente ou via proxy Gateway (8080)
            const res = await axios.post("http://127.0.0.1:8000/api/v1/profile/parse-linkedin", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setProfile({ linkedinText: res.data.extracted_text });
            setMessage("LinkedIn profile extracted successfully!");
        } catch (error) {
            setMessage("Error extracting LinkedIn PDF.");
        } finally {
            setParsing(false);
        }
    };

    const handleGitHubSearch = async () => {
    if (!profile.githubUser) return;
    setGithubLoading(true);
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/v1/profile/github/\${profile.githubUser}`);
      const bio = res.data.bio || "";
      const repos = res.data.top_repos || [];
      const reposText = repos.map((r: any) => `\${r.name}: \${r.description} (\${r.language})`).join("\n");
      
      // Atualiza o Master CV Text com o texto do GitHub
      const newCvText = `GitHub Bio: \${bio}\n\nTop Projects:\n\${reposText}`;
      setProfile({ masterCvText: newCvText });
      setMessage("GitHub profile synced!");
    } catch (error) {
      setMessage("Error fetching GitHub profile.");
    } finally {
      setGithubLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">👤 My Profile Hub</h1>
          <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900 font-medium">Logout</button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl border border-gray-200 p-8 shadow-sm">
          
          {saveMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
              ✅ {saveMessage}
            </div>
          )}

          <div className="space-y-8">
            {/* Secao 1: Dados Basicos */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">1. Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                  <input 
                    type="text" 
                    value={profile.title} 
                    onChange={(e) => setProfile({ title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </section>

            {/* Secao 2: Skills */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">2. Core Skills</h2>
              <p className="text-xs text-gray-500 mb-2">Separated by commas</p>
              <input 
                type="text" 
                value={profile.skills.join(", ")} 
                onChange={(e) => setProfile({ skills: e.target.value.split(",").map(s => s.trim()) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </section>

            {/* Secao 3: LinkedIn PDF */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">3. LinkedIn Profile Import</h2>
              <p className="text-sm text-gray-600 mb-4">
                Go to your LinkedIn profile → More → Save to PDF, and upload the PDF here to extract your full work history.
              </p>
              <div className="flex items-center gap-4">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setLinkedinFile(e.target.files?.[0] || null)}
                  className="text-sm text-gray-600"
                />
                <button 
                  onClick={handleLinkedInUpload}
                  disabled={parsing || !linkedinFile}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-semibold"
                >
                  {parsing ? "Extracting..." : "Extract PDF"}
                </button>
              </div>
              {profile.linkedinText && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100 max-h-32 overflow-y-auto text-xs text-gray-600">
                  {profile.linkedinText}
                </div>
              )}
            </section>

            {/* Secao 4: GitHub Integration */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">4. GitHub Integration</h2>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={profile.githubUser} 
                  onChange={(e) => setProfile({ githubUser: e.target.value })}
                  placeholder="e.g. torvalds"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button 
                  onClick={handleGitHubSearch}
                  disabled={githubLoading || !profile.githubUser}
                  className="px-4 py-2 bg-gray-800 text-white text-sm rounded-lg hover:bg-gray-900 transition disabled:opacity-50 font-semibold"
                >
                  {githubLoading ? "Fetching..." : "Sync GitHub"}
                </button>
              </div>
            </section>

            {/* Secao 5: Master CV Text */}
            <section>
              <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">5. Master CV Base (Consolidated)</h2>
              <p className="text-xs text-gray-500 mb-2">The AI will use this combined text as ground truth for generating tailored CVs.</p>
              <textarea 
                value={profile.masterCvText}
                onChange={(e) => setProfile({ masterCvText: e.target.value })}
                rows={10}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              />
            </section>
          </div>
        </div>
      </div>
    </main>
  ); 
}
