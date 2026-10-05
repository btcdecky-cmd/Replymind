import { Check, Copy, RefreshCw, Scissors, Wand2 } from "lucide-react";
import { useState } from "react";
import { TONE_MAP, isToneId } from "@/lib/tones";
import { ToneIcon } from "../tone-icon";
import { Button } from "../ui/button";
import { Card } from "../ui/card";

export function ReplyCard({
  style,
  body,
  onCopy,
  onRewrite,
  onShorten,
  onRegenerate,
  busy,
}: {
  style: string;
  body: string;
  onCopy: () => Promise<void> | void;
  onRewrite: () => void;
  onShorten: () => void;
  onRegenerate: () => void;
  busy?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const meta = isToneId(style) ? TONE_MAP[style] : null;

  async function copy() {
    await onCopy();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        {meta ? <ToneIcon icon={meta.icon} className="h-4 w-4 text-muted" /> : null}
        {meta?.label ?? style}
      </div>
      <p className="mt-3 whitespace-pre-wrap text-[15px] leading-relaxed">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onClick={() => void copy()} disabled={busy}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied" : "Copy"}
        </Button>
        <Button size="sm" variant="ghost" onClick={onRegenerate} disabled={busy}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
        <Button size="sm" variant="ghost" onClick={onShorten} disabled={busy}>
          <Scissors className="h-4 w-4" />
          Shorten
        </Button>
        <Button size="sm" variant="ghost" onClick={onRewrite} disabled={busy}>
          <Wand2 className="h-4 w-4" />
          Rewrite
        </Button>
      </div>
    </Card>
  );
}
