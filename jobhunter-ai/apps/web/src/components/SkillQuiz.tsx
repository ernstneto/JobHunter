"use client";

import { useState } from "react";

interface SkillQuizProps {
    jobId: string;
    questions: string[];
    onConfirm: (confirmedSkills: string[]) => void;
    onCancel: () => void;
}

export default function SkillQuiz({jobId, questions, onConfirm, onCancel}: SkillQuizProps) {
    const [answers, setAnswers] = useState<Record<number, boolean>>({});

    const handleSubmit = () => {
        const confirmed = questions.filter((_, idx) => answers[idx]);
        onConfirm(confirmed);
    };

    return (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">🧠 Skill Check</h2>
        <p className="text-sm text-gray-600 mb-6">
          Before generating your optimized CV, do you have experience with the following required skills?
        </p>

        <div className="space-y-4 mb-6">
          {questions.map((question, idx) => (
            <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
              <span className="text-sm font-medium text-gray-800">{question}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [idx]: true })}
                  className={`px-3 py-1 rounded text-xs font-bold transition \${
                    answers[idx] === true ? "bg-green-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  YES
                </button>
                <button
                  type="button"
                  onClick={() => setAnswers({ ...answers, [idx]: false })}
                  className={`px-3 py-1 rounded text-xs font-bold transition \${
                    answers[idx] === false ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  NO
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-6 py-2 bg-primary-600 text-white text-sm rounded-lg font-bold hover:bg-primary-700 transition"
          >
            Generate Tailored CV →
          </button>
        </div>
      </div>
    </div>
    );
}