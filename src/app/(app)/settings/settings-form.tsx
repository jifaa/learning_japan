"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/fade-in";
import { updateUserPreferencesAction } from "@/server/actions/settings.actions";

interface SettingsFormProps {
  initialName: string;
  initialEmail: string;
  initialDailyGoal: number;
  initialNewCards: number;
}

export function SettingsForm({ initialName, initialEmail, initialDailyGoal, initialNewCards }: SettingsFormProps) {
  const [name, setName] = useState(initialName);
  const [dailyGoal, setDailyGoal] = useState(initialDailyGoal);
  const [newCards, setNewCards] = useState(initialNewCards);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    // In a real app, call updateUserPreferencesAction here
    await new Promise(r => setTimeout(r, 500)); // Simulate save
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nama Tampilan</Label>
          <Input id="name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={initialEmail} disabled />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="daily-goal">Target Kartu Harian</Label>
          <Input id="daily-goal" type="number" value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))} min={1} max={200} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="new-cards">Kartu Baru Per Hari</Label>
          <Input id="new-cards" type="number" value={newCards} onChange={e => setNewCards(Number(e.target.value))} min={1} max={50} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button size="sm" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
        {saved && <span className="text-sm text-primary">Tersimpan!</span>}
      </div>
    </>
  );
}
