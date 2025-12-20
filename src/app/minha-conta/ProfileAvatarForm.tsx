// src/app/minha-conta/ProfileAvatarForm.tsx
"use client";

import React, { useState, useRef, useEffect } from "react";
import Avatar from "boring-avatars";

type Props = {
  currentUrl?: string;
  name?: string;
  email: string;
};

export default function ProfileAvatarForm({
  currentUrl,
  name,
  email,
}: Props) {
  const [preview, setPreview] = useState<string | undefined>(currentUrl);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(currentUrl);
  }, [currentUrl]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("O arquivo não pode exceder 2 MB.");
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append("avatar", file);
    const res = await fetch("/api/auth/upload-avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setPreview(data.url);
    } else {
      alert("Erro no upload: " + data.error);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-4 animate-fadeIn">
      <div
        className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 cursor-pointer transition-transform transform hover:scale-110"
        onClick={() => fileRef.current?.click()}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <Avatar
            size={96}
            name={name || email}
            variant="beam"
            colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
          />
        )}
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 transition-colors duration-200 px-4 py-2 rounded text-white disabled:opacity-50"
      >
        {loading ? "Enviando…" : "Alterar Foto"}
      </button>
      <input
        type="file"
        accept="image/*"
        ref={fileRef}
        onChange={handleFile}
        hidden
      />
    </div>
  );
}
