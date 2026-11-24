"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/**
 * Perfil do usuario — fonte única de verdade do produto.
 * Dados pessoais + hard skills alimentam: match de vagas, geração de CV
 * (Master CV) e, no futuro, o Workspace /jobs/[id]/tailor.
 *
 * POC: persistencia em localStorage (chave user_profile).
 */
export interface UserProfileData {
  // Dados pessoais
  name: string;
  title: string;
  location: string;
  summary: string;
  experience_years: string;
  seniority: "junior" | "mid" | "senior" | "lead";
  languages: string[];
  english_level: string;
  availability: string;

  // Hard skills
  skills: string[];

  // Integrações e Master CV
  linkedinText: string;
  githubUser: string;
  masterCvText: string;
}

const defaultProfile: UserProfileData = {
  name: "Ernst",
  title: "Python / Full Stack Developer",
  location: "Brazil / Remote",
  summary: "",
  experience_years: "3",
  seniority: "mid",
  languages: ["Portuguese", "English"],
  english_level: "advanced",
  availability: "",
  skills: [
    "Python",
    "FastAPI",
    "SQL",
    "PostgreSQL",
    "Docker",
    "Git",
    "React",
    "TypeScript",
    "REST APIs",
  ],
  linkedinText: "",
  githubUser: "",
  masterCvText: "",
};

interface ProfileContextValue {
  profile: UserProfileData;
  setProfile: (data: Partial<UserProfileData>) => void;
  addSkill: (skill: string) => void;
  removeSkill: (skill: string) => void;
}

const ProfileContext = createContext<ProfileContextValue>({
  profile: defaultProfile,
  setProfile: () => {},
  addSkill: () => {},
  removeSkill: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfileData>(defaultProfile);

  // Carregar do localStorage no primeiro load (com migração de campos novos)
  useEffect(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      try {
        const parsed: Partial<UserProfileData> = JSON.parse(saved);
        setProfileState({ ...defaultProfile, ...parsed });
      } catch {
        // dados corrompidos: usa o perfil padrão
      }
    }
  }, []);

  const setProfile = useCallback((data: Partial<UserProfileData>) => {
    setProfileState((prev) => {
      const next = { ...prev, ...data };
      try {
        localStorage.setItem("user_profile", JSON.stringify(next));
      } catch {
        // armazenamento indisponível: mantém em memória
      }
      return next;
    });
  }, []);

  const addSkill = useCallback(
    (skill: string) => {
      const clean = skill.trim();
      if (!clean) return;
      setProfileState((prev) => {
        const exists = prev.skills.some(
          (s) => s.toLowerCase() === clean.toLowerCase()
        );
        if (exists) return prev;
        const next = { ...prev, skills: [...prev.skills, clean] };
        try {
          localStorage.setItem("user_profile", JSON.stringify(next));
        } catch {
          // armazenamento indisponível: mantém em memória
        }
        return next;
      });
    },
    []
  );

  const removeSkill = useCallback((skill: string) => {
    setProfileState((prev) => {
      const next = { ...prev, skills: prev.skills.filter((s) => s !== skill) };
      try {
        localStorage.setItem("user_profile", JSON.stringify(next));
      } catch {
        // armazenamento indisponível: mantém em memória
      }
      return next;
    });
  }, []);

  return (
    <ProfileContext.Provider
      value={{ profile, setProfile, addSkill, removeSkill }}
    >
      {children}
    </ProfileContext.Provider>
  );
}
