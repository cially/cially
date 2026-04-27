"use client"

import { Card, CardTitle, CardHeader, CardContent } from "../ui/card";
import { Bot, Eye, EyeOff, Settings2 } from "lucide-react";
import { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { createAgent } from "./agentManager";
import { cn } from "@/lib/utils";
import { PROVIDERS_DATA } from "./providers";

const PROVIDERS = PROVIDERS_DATA as Record<string, { name: string; models: string[] }>;

export default function SetupAgents({ onComplete }: { onComplete?: () => void }) {
  const [provider, setProvider] = useState<string>("groq");
  const [model, setModel] = useState(PROVIDERS.groq.models[0]);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [customModel, setCustomModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as keyof typeof PROVIDERS;
    setProvider(newProvider);
    setModel(PROVIDERS[newProvider].models[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const data = {
      provider,
      model: isAdvanced ? customModel : model,
      apiKey,
    };

    const success = await createAgent(data);

    if (success) {
      toast.success("AI Agent configured successfully!");
      if (onComplete) onComplete();
    } else {
      toast.error("Failed to configure AI Agent. Please check your credentials.");
    }

    setIsSubmitting(false);
  };

  return (
    <Card className="mt-10 grid auto-rows-auto px-10 py-6 sm:min-w-dvh">
      <CardHeader className="px-0">
        <CardTitle className="font-semibold text-xl flex items-center gap-2">
          <Bot className="inline" />
          Setup your AI Agent
        </CardTitle>
        <div className="mt-1 font-sans text-sm text-white/60">
          Enable Cially's AI features by creating a new agent
        </div>
      </CardHeader>

      <CardContent className="px-0 pt-4">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid gap-3">
            <Label htmlFor="provider">Provider</Label>
            <select
              id="provider"
              value={provider}
              onChange={handleProviderChange}
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30"
            >
              {Object.entries(PROVIDERS).map(([id, p]) => (
                <option key={id} value={id} className="bg-slate-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="model">Model</Label>
              <button
                type="button"
                onClick={() => setIsAdvanced(!isAdvanced)}
                className={cn(
                  "flex items-center gap-1.5 text-xs transition-colors",
                  isAdvanced ? "text-primary" : "text-white/40 hover:text-white/60"
                )}
              >
                <Settings2 size={14} />
                Custom
              </button>
            </div>

            {isAdvanced ? (
              <Input
                id="customModel"
                placeholder="Enter custom model ID (e.g. gpt-4-32k)"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                required
              />
            ) : (
              <select
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring dark:bg-input/30"
              >
                {PROVIDERS[provider].models.map((m) => (
                  <option key={m} value={m} className="bg-slate-900 text-white">
                    {m}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid gap-3">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative group">
              <Input
                id="apiKey"
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className={cn(
                  "pr-10 transition-all font-mono",
                  !showApiKey && "text-transparent caret-white selection:bg-primary/30"
                )}
                placeholder="Paste your API key here"
                required
                autoComplete="off"
              />
              {!showApiKey && apiKey && (
                <div className="pointer-events-none absolute inset-0 flex items-center px-3 text-sm font-mono tracking-tight">
                  <span className="text-white whitespace-pre">{apiKey.slice(0, 2)}</span>
                  <span className="blur-[5px] select-none opacity-80 whitespace-pre">{apiKey.slice(2)}</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                title={showApiKey ? "Hide API Key" : "Show API Key"}
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-2 border-white/10 text-white/80 transition-all hover:bg-white/5 hover:cursor-pointer"
            variant="outline"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Configuring..." : "Initialize Agent"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
