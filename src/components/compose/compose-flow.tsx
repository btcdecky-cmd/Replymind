import { useNavigate } from "@tanstack/react-router";
import { Camera, FileText, Keyboard, Loader2, Upload, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { compressScreenshot } from "@/lib/image/compress";
import { analyzeInput } from "@/lib/server/analyze";
import { DEFAULT_GENERATE_TONES, TONES, type ToneId } from "@/lib/tones";
import { friendlyError } from "@/lib/utils";
import { ToneIcon } from "../tone-icon";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";

const STEPS = ["Reading conversation…", "Understanding the context…", "Writing replies…"] as const;

type Mode = "pick" | "screenshot" | "paste" | "message";

export function ComposeFlow({ conversationId }: { conversationId?: string }) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<Mode>("pick");
  const [preview, setPreview] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [instruction, setInstruction] = useState("");
  const [styles, setStyles] = useState<ToneId[]>([...DEFAULT_GENERATE_TONES]);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function onFile(file: File) {
    setError(null);
    try {
      const dataUrl = await compressScreenshot(file);
      setPreview(dataUrl);
      setMode("screenshot");
    } catch (err) {
      setError(friendlyError(err, "Could not read that screenshot."));
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) void onFile(file);
  }

  function toggleStyle(id: ToneId) {
    setStyles((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== id);
      }
      if (prev.length >= 5) return prev;
      return [...prev, id];
    });
  }

  async function submit() {
    setError(null);
    if (mode === "screenshot" && !preview) {
      setError("Add a screenshot first.");
      return;
    }
    if ((mode === "paste" || mode === "message") && !text.trim()) {
      setError("Add the conversation or the latest message.");
      return;
    }
    setBusy(true);
    setStep(0);
    const timers = [
      window.setTimeout(() => setStep(1), 900),
      window.setTimeout(() => setStep(2), 2200),
    ];
    try {
      const result = await analyzeInput({
        data: {
          imageDataUrl: mode === "screenshot" ? preview ?? undefined : undefined,
          conversationText: mode === "screenshot" ? undefined : text.trim(),
          instruction: instruction.trim() || undefined,
          styles,
          conversationId,
        },
      });
      void navigate({ to: "/app/c/$conversationId", params: { conversationId: result.conversationId } });
    } catch (err) {
      setError(friendlyError(err));
      setBusy(false);
    } finally {
      timers.forEach((t) => window.clearTimeout(t));
    }
  }

  if (busy) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
        <p className="mt-4 font-display text-2xl">{STEPS[step]}</p>
        <p className="mt-2 max-w-xs text-sm text-muted">This stays on your account. Nothing is shown from the model’s private notes.</p>
      </div>
    );
  }

  if (mode === "pick") {
    return (
      <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-6">
        <h1 className="font-display text-3xl">What’s the situation?</h1>
        <p className="mt-2 text-muted">Upload a screenshot, paste the thread, or type the last line.</p>
        <div className="mt-6 grid gap-3">
          <Choice
            icon={Camera}
            title="Upload screenshot"
            body="Camera or photo library. JPG, PNG, WEBP."
            onClick={() => inputRef.current?.click()}
          />
          <Choice icon={FileText} title="Paste conversation" body="Drop in the thread as text." onClick={() => setMode("paste")} />
          <Choice icon={Keyboard} title="Type message" body="Just the latest line is enough." onClick={() => setMode("message")} />
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void onFile(file);
            e.currentTarget.value = "";
          }}
        />
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-lg px-4 pb-28 pt-4">
      <button type="button" className="text-sm text-muted" onClick={() => { setMode("pick"); setPreview(null); }}>
        Back
      </button>
      <h1 className="mt-3 font-display text-3xl">
        {mode === "screenshot" ? "Review screenshot" : mode === "paste" ? "Paste the thread" : "What’s the last message?"}
      </h1>

      {mode === "screenshot" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          className={`mt-4 overflow-hidden rounded-xl border border-dashed ${dragOver ? "border-primary bg-surface-2" : "border-border bg-surface"}`}
        >
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Conversation screenshot preview" className="max-h-80 w-full object-contain bg-surface-2" />
              <button
                type="button"
                className="absolute right-3 top-3 rounded-full bg-bg/90 p-2"
                aria-label="Remove screenshot"
                onClick={() => setPreview(null)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button type="button" className="flex w-full flex-col items-center gap-2 px-4 py-12 text-muted" onClick={() => inputRef.current?.click()}>
              <Upload className="h-6 w-6" />
              <span>Tap to upload, or drop an image here</span>
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void onFile(file);
              e.currentTarget.value = "";
            }}
          />
        </div>
      ) : (
        <Textarea
          className="mt-4"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={mode === "paste" ? "Paste the conversation here…" : "e.g. I don’t want this to feel complicated."}
        />
      )}

      <div className="mt-6">
        <Label htmlFor="instruction">What do you want to say?</Label>
        <Textarea
          id="instruction"
          className="mt-2 min-h-24"
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="I want her to know I’m not angry."
        />
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium">Styles</p>
        <p className="text-xs text-muted">Pick up to five. Each one becomes its own reply card.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {TONES.map((tone) => {
            const on = styles.includes(tone.id);
            return (
              <button
                key={tone.id}
                type="button"
                onClick={() => toggleStyle(tone.id)}
                className={`inline-flex min-h-10 items-center gap-1.5 rounded-full border px-3 text-sm ${on ? "border-primary bg-primary text-primary-fg" : "border-border bg-surface text-fg"}`}
              >
                <ToneIcon icon={tone.icon} className="h-3.5 w-3.5" />
                {tone.label}
              </button>
            );
          })}
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

      <Button className="mt-6 w-full" size="lg" onClick={() => void submit()}>
        Write replies
      </Button>
    </div>
  );
}

function Choice({
  icon: Icon,
  title,
  body,
  onClick,
}: {
  icon: typeof Camera;
  title: string;
  body: string;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="text-left">
      <Card className="flex items-start gap-4 p-4 transition-colors hover:bg-surface-2">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-surface-2">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-medium">{title}</span>
          <span className="mt-1 block text-sm text-muted">{body}</span>
        </span>
      </Card>
    </button>
  );
}
