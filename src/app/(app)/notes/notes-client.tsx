"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FadeIn } from "@/components/motion/fade-in";
import { FileText, Plus, Trash2, Edit3, Check, X } from "lucide-react";
import { upsertNote, deleteNoteAction } from "@/server/actions/note.actions";

interface NoteItem {
  id: string;
  content_type: string;
  content_id: string;
  title: string | null;
  body: string;
  created_at: string;
  updated_at: string;
}

interface NotesClientProps {
  initialNotes: NoteItem[];
}

const TYPE_LABELS: Record<string, string> = {
  vocabulary: "Kosakata",
  kanji: "Kanji",
  grammar: "Tata Bahasa",
  lesson: "Pelajaran",
  kana: "Kana",
};

export function NotesClient({ initialNotes }: NotesClientProps) {
  const [notes, setNotes] = useState(initialNotes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editTitle, setEditTitle] = useState("");

  const handleEdit = (note: NoteItem) => {
    setEditingId(note.id);
    setEditTitle(note.title || "");
    setEditBody(note.body);
  };

  const handleSave = async (noteId: string) => {
    await upsertNote(noteId, editTitle, editBody);
    setNotes(prev => prev.map(n => n.id === noteId ? { ...n, title: editTitle, body: editBody } : n));
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditTitle("");
    setEditBody("");
  };

  const handleDelete = async (noteId: string) => {
    await deleteNoteAction(noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  };

  if (notes.length === 0) {
    return (
      <FadeIn>
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <FileText className="mx-auto h-10 w-10 opacity-30" />
            <p className="mt-3">Belum ada catatan.</p>
            <p className="text-sm">Catatan akan muncul saat Anda menambahkan dari halaman kosakata, kanji, atau tata bahasa.</p>
          </CardContent>
        </Card>
      </FadeIn>
    );
  }

  return (
    <div className="space-y-3">
      {notes.map((note, i) => (
        <FadeIn key={note.id} delay={i * 0.03}>
          <Card className="transition-shadow duration-150 hover:shadow-sm">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="shrink-0 rounded bg-surface px-2 py-0.5 text-xs text-muted-foreground">
                    {TYPE_LABELS[note.content_type] || note.content_type}
                  </span>
                  {note.content_id && (
                    <span className="truncate text-xs text-muted-foreground">
                      #{note.content_id}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {editingId === note.id ? (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleSave(note.id)} className="text-success">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleCancel} className="text-error">
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(note)}>
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(note.id)} className="text-error hover:bg-error/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {editingId === note.id ? (
                <div className="space-y-2">
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Judul catatan"
                    className="text-sm font-medium"
                  />
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    placeholder="Tulis catatan Anda di sini..."
                    rows={4}
                    className="text-sm"
                  />
                </div>
              ) : (
                <>
                  {note.title && <p className="text-sm font-medium">{note.title}</p>}
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.body}</p>
                  <p className="text-xs text-muted-foreground">
                    Diperbarui {new Date(note.updated_at).toLocaleDateString("id-ID")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </FadeIn>
      ))}
    </div>
  );
}
