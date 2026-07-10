"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setSaved(false);
    setError(null);

    try {
      const result = await updateUserPreferencesAction({
        displayName: name,
        dailyGoal,
        newCardsPerDay: newCards,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error || "Gagal menyimpan");
      }
    } catch (e) {
      setError("Terjadi kesalahan saat menyimpan");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}
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
