"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface UserProfileData {
  name: string;
  title: string;
  skills: string[];
  linkedinText: string;
  githubUser: string;
  masterCvText: string;
}

const defaultProfile: UserProfileData = {
  name: "Ernst",
  title: "Python / Full Stack Developer",
  skills: ["Python", "FastAPI", "SQL", "PostgreSQL", "Docker", "Git"],
  linkedinText: "",
  githubUser: "",
  masterCvText: "",
};

const ProfileContext = createContext<{
  profile: UserProfileData;
  setProfile: (data: Partial<UserProfileData>) => void;
}>({
  profile: defaultProfile,
  setProfile: () => {},
});

export const useProfile = () => useContext(ProfileContext);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfileState] = useState<UserProfileData>(defaultProfile);

  // Carregar do localStorage no primeiro load
  useEffect(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      setProfileState(JSON.parse(saved));
    }
  }, []);

  const setProfile = (data: Partial<UserProfileData>) => {
    const newProfile = { ...profile, ...data };
    setProfileState(newProfile);
    localStorage.setItem("user_profile", JSON.stringify(newProfile));
  };

  return (
    <ProfileContext.Provider value={{ profile, setProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}