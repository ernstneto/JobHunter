"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProfile, type UserProfileData } from "@/lib/ProfileContext";
import { isAuthenticated, logout } from "@/lib/auth";
import { apiClient } from "@/lib/api";

const SENIORITY_OPTIONS = ["junior", "mid", "senior", "lead"] as const;
const ENGLISH_OPTIONS = ["basic", "intermediate", "advanced", "fluent"] as const;

export default function ProfilePage() {
    const router = useRouter();
    const { profile, setProfile, addSkill, removeSkill } = useProfile();

    const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
    const [parsing, setParsing] = useState(false);
    const [githubLoading, setGithubLoading] = useState(false);
    const [saveMessage, setMessage] = useState("");
    const [skillInput, setSkillInput] = useState("");

    // Redirecionar se nao estiver logado
    if (typeof window !== "undefined" && !isAuthenticated()) {
        router.push("/login");
        return null;
    }

    const handleAddSkill = () => {
        addSkill(skillInput);
        setSkillInput("");
    };

    const handleLinkedInUpload = async () => {
        if (!linkedinFile) return;
        setParsing(true);
        setMessage("");

        try {
            // Via gateway (8080) -> ai-service (8000)
            const formData = new FormData();
            formData.append("file", linkedinFile);

            const res = await apiClient.post(
                "/api/v1/profile/parse-linkedin",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            setProfile({ linkedinText: res.data.extracted_text || "" });
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
        setMessage("");
        try {
            const res = await apiClient.get(`/api/v1/profile/github/${profile.githubUser}`);
            const bio = res.data.bio || "";
            const repos = res.data.top_repos || [];
            const reposText = repos
                .map((r: { name: string; description: string; language: string }) =>
                    `${r.name}: ${r.description} (${r.language})`
                )
                .join("\n");

            // Atualiza o Master CV Text com o texto do GitHub
            const newCvText = `GitHub Bio: ${bio}\n\nTop Projects:\n${reposText}`;
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
                    <button onClick={logout} className="text-sm text-gray-600 hover:text-gray-900 font-medium">
                        Logout
                    </button>
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
                        {/* Secao 1: Dados Pessoais */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                1. Dados Pessoais
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nome completo
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.name}
                                        onChange={(e) => setProfile({ name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cargo / Título profissional
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.title}
                                        onChange={(e) => setProfile({ title: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Localização
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.location}
                                        onChange={(e) => setProfile({ location: e.target.value })}
                                        placeholder="e.g. Rio de Janeiro, Brasil / Remoto"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Anos de experiência
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={profile.experience_years}
                                        onChange={(e) => setProfile({ experience_years: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Senioridade
                                    </label>
                                    <select
                                        value={profile.seniority}
                                        onChange={(e) =>
                                            setProfile({ seniority: e.target.value as UserProfileData["seniority"] })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        {SENIORITY_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Inglês
                                    </label>
                                    <select
                                        value={profile.english_level}
                                        onChange={(e) => setProfile({ english_level: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                                    >
                                        {ENGLISH_OPTIONS.map((s) => (
                                            <option key={s} value={s}>
                                                {s}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Disponibilidade
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.availability}
                                        onChange={(e) => setProfile({ availability: e.target.value })}
                                        placeholder="e.g. Imediato / 30 dias / Sob consulta"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Idiomas (separados por vírgula)
                                    </label>
                                    <input
                                        type="text"
                                        value={profile.languages.join(", ")}
                                        onChange={(e) =>
                                            setProfile({
                                                languages: e.target.value
                                                    .split(",")
                                                    .map((s) => s.trim())
                                                    .filter(Boolean),
                                            })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Resumo profissional (summary)
                                </label>
                                <textarea
                                    rows={3}
                                    value={profile.summary}
                                    onChange={(e) => setProfile({ summary: e.target.value })}
                                    placeholder="Uma linha sobre sua trajetória e o que busca..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                                />
                            </div>
                        </section>

                        {/* Secao 2: Hard Skills */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                2. Hard Skills
                            </h2>
                            <p className="text-xs text-gray-500 mb-3">
                                As skills alimentam o match de vagas e a geração de CV sob medida.
                                Adicione uma por uma.
                            </p>

                            <div className="flex gap-2 mb-4">
                                <input
                                    type="text"
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                    placeholder="Ex.: AWS, Kubernetes, Pandas..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="px-5 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition font-semibold"
                                >
                                    Adicionar
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                {profile.skills.length === 0 && (
                                    <span className="text-xs text-gray-400">
                                        Nenhuma skill adicionada ainda.
                                    </span>
                                )}
                                {profile.skills.map((skill) => (
                                    <span
                                        key={skill}
                                        className="inline-flex items-center gap-1 bg-primary-50 text-primary-800 border border-primary-200 text-xs font-medium px-3 py-1.5 rounded-full"
                                    >
                                        {skill}
                                        <button
                                            type="button"
                                            onClick={() => removeSkill(skill)}
                                            className="text-primary-400 hover:text-primary-700 font-bold leading-none"
                                            aria-label={`Remover ${skill}`}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {profile.skills.length} skill{profile.skills.length !== 1 ? "s" : ""} cadastrada
                                {profile.skills.length !== 1 ? "s" : ""}
                            </p>
                        </section>

                        {/* Secao 3: LinkedIn PDF */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                3. LinkedIn Profile Import
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                No LinkedIn: Mais → Salvar como PDF, e envie o PDF aqui para extrair
                                seu histórico de trabalho.
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
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                4. GitHub Integration
                            </h2>
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

                        {/* Secao 5: Master CV */}
                        <section>
                            <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                5. Master CV Base (Consolidated)
                            </h2>
                            <p className="text-xs text-gray-500 mb-2">
                                O texto consolidado é a fonte de verdade para a geração de CVs
                                sob medida (anti-alucinação).
                            </p>
                            <textarea
                                value={profile.masterCvText}
                                onChange={(e) => setProfile({ masterCvText: e.target.value })}
                                rows={10}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                            />
                        </section>

                        <p className="text-xs text-gray-400">
                            💾 Tudo é salvo automaticamente no navegador (POC em localStorage).
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
