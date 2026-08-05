// src/components/admin/LessonVideoField.jsx
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Save, Video, CheckCircle2 } from "lucide-react";

export default function LessonVideoField({ lessonVersionId, onSaveComplete }) {
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    base44.entities.LessonVersion.get(lessonVersionId)
      .then((v) => { if (active) setVideoUrl(v?.video_url || ""); })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [lessonVersionId]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await base44.entities.LessonVersion.update(lessonVersionId, { video_url: videoUrl.trim() });
      setSaved(true);
      onSaveComplete?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      alert("Gagal menyimpan URL video.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-heading font-bold text-primary">
        <Video className="w-4 h-4" /> URL Video Pengajaran / Story Visual
      </div>
      <p className="text-xs text-muted-foreground">
        Tampal pautan video MP4 Firebase Storage atau pautan YouTube. Video ini akan dipaparkan secara automatik kepada murid.
      </p>
      <div className="flex gap-2">
        <Input
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          placeholder="https://firebasestorage.googleapis.com/.../video.mp4 atau https://youtube.com/..."
          disabled={loading || saving}
        />
        <Button onClick={handleSave} disabled={saving || loading} size="sm" className="shrink-0">
          {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : saved ? <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-500" /> : <Save className="w-4 h-4 mr-1" />}
          {saving ? "Menyimpan..." : saved ? "Disimpan" : "Simpan"}
        </Button>
      </div>
    </div>
  );
}