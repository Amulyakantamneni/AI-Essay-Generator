'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  ScrollText,
  MessageCircle,
  Sparkles,
  Bot,
  Copy,
  Download,
  CheckCircle2,
  AlignLeft,
} from 'lucide-react';

type WritingTool =
  | 'essay'
  | 'report'
  | 'article'
  | 'summary'
  | 'explanation'
  | 'social';

type Tone = 'academic' | 'casual';

type LengthKey =
  | 'short'
  | 'medium'
  | 'long'
  | 'brief'
  | 'standard'
  | 'detailed'
  | 'bullet'
  | 'paragraph'
  | 'simple'
  | 'moderate'
  | 'tweet'
  | 'post'
  | 'thread';

interface ToolConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
  lengths: { value: LengthKey; label: string; hint: string }[];
}

const TOOL_CONFIG: Record<WritingTool, ToolConfig> = {
  essay: {
    label: 'Essay Writer',
    description: 'Academic essays with structure and depth.',
    icon: <FileText className="w-5 h-5" />,
    lengths: [
      { value: 'short', label: 'Short', hint: '300–500 words' },
      { value: 'medium', label: 'Medium', hint: '500–800 words' },
      { value: 'long', label: 'Long', hint: '800–1200 words' },
    ],
  },
  report: {
    label: 'Report Generator',
    description: 'Business / project reports with findings & recommendations.',
    icon: <ScrollText className="w-5 h-5" />,
    lengths: [
      { value: 'brief', label: 'Brief', hint: '400–600 words' },
      { value: 'standard', label: 'Standard', hint: '700–1000 words' },
      { value: 'detailed', label: 'Detailed', hint: '1200–1500 words' },
    ],
  },
  article: {
    label: 'Article Writer',
    description: 'Blog posts & articles with hooks and subheadings.',
    icon: <AlignLeft className="w-5 h-5" />,
    lengths: [
      { value: 'short', label: 'Short', hint: '400–600 words' },
      { value: 'medium', label: 'Medium', hint: '700–1000 words' },
      { value: 'long', label: 'Long', hint: '1200–1500 words' },
    ],
  },
  summary: {
    label: 'Text Summarizer',
    description: 'Condense long text into key takeaways.',
    icon: <Sparkles className="w-5 h-5" />,
    lengths: [
      { value: 'bullet', label: 'Bullet', hint: 'Key bullet points' },
      { value: 'paragraph', label: 'Paragraph', hint: '2–3 short paragraphs' },
      { value: 'detailed', label: 'Detailed', hint: 'Full but concise overview' },
    ],
  },
  explanation: {
    label: 'Explainer',
    description: 'Explain complex topics simply and clearly.',
    icon: <Bot className="w-5 h-5" />,
    lengths: [
      { value: 'simple', label: 'Simple', hint: 'ELI5 style explanation' },
      { value: 'moderate', label: 'Moderate', hint: 'Balanced detail' },
      { value: 'detailed', label: 'Detailed', hint: 'In-depth walkthrough' },
    ],
  },
  social: {
    label: 'Social Media',
    description: 'Posts for X / Instagram / LinkedIn.',
    icon: <MessageCircle className="w-5 h-5" />,
    lengths: [
      { value: 'tweet', label: 'Tweet', hint: 'Up to 280 characters' },
      { value: 'post', label: 'Post', hint: 'Standard social caption' },
      { value: 'thread', label: 'Thread', hint: 'Multi-post thread' },
    ],
  },
};

export default function AIWritingStudio() {
  const [tool, setTool] = useState<WritingTool>('essay');
  const [topic, setTopic] = useState('');
  const [tone, setTone] = useState<Tone>('academic');
  const [lengthKey, setLengthKey] = useState<LengthKey>('medium');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [toolUsed, setToolUsed] = useState<WritingTool | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const outputRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://ai-essay-generator-2.onrender.com';

  // Scroll to output when new content arrives
  useEffect(() => {
    if (content && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [content]);

  const currentToolConfig = TOOL_CONFIG[tool];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic or text to work with.');
      return;
    }

    setLoading(true);
    setError('');
    setContent('');
    setWordCount(0);
    setToolUsed(null);

    try {
      const res = await fetch(`${API_URL}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool,
          topic,
          length: lengthKey,
          tone,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTP ${res.status}: ${text}`);
      }

      const data = await res.json();
      setContent(data.content || '');
      setWordCount(data.word_count || 0);
      setToolUsed(data.tool_used || tool);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownloadTxt = () => {
    if (!content) return;
    const file = new Blob([content], { type: 'text/plain' });
    const link = document.createElement('a');
    const safeTool = (toolUsed || tool).replace('_', '-');
    link.href = URL.createObjectURL(file);
    link.download = `${safeTool}-${topic.slice(0, 24) || 'ai-writing'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const wordLabel =
    wordCount === 0 ? 'No words yet' : `${wordCount.toLocaleString()} words`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 text-slate-900">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 via-blue-500 to-indigo-500 shadow-md shadow-sky-200">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600">
                AI Writing Studio
              </span>
              <p className="text-xs text-slate-500">
                Professional content generation for essays, reports & more.
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 shadow-sm">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Backend: Online
            </div>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:flex-row">
        {/* Left: tool selector + controls */}
        <section className="flex w-full flex-col gap-4 lg:w-[42%]">
          {/* Tool selector card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Choose your writing tool
                </h2>
                <p className="text-xs text-slate-500">
                  One topic, different formats. Switch tools instantly.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {(Object.keys(TOOL_CONFIG) as WritingTool[]).map((key) => {
                const cfg = TOOL_CONFIG[key];
                const isActive = tool === key;

                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => {
                      setTool(key);
                      const first = TOOL_CONFIG[key].lengths[0];
                      setLengthKey(first.value);
                    }}
                    className={`group flex flex-col items-start gap-1 rounded-xl border px-3 py-3 text-left text-xs transition-all
                    ${
                      isActive
                        ? 'border-sky-500 bg-sky-50 shadow-sm shadow-sky-100'
                        : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                          isActive ? 'bg-sky-100 text-sky-700' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {cfg.icon}
                      </span>
                      <span className="text-[0.78rem] font-semibold text-slate-900">
                        {cfg.label}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.7rem] text-slate-500">
                      {cfg.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Prompt / controls card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">
              Describe your topic
            </h3>
            <div className="relative mb-4">
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={4}
                placeholder="Explain your topic or paste text here. Example: “Impact of social media on teenage mental health”"
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-200"
              />
              <div className="pointer-events-none absolute bottom-2 right-3 text-[0.68rem] text-slate-400">
                {topic.length}/1000
              </div>
            </div>

            {/* Length & tone */}
            <div className="mb-4 flex flex-col gap-3 md:flex-row">
              {/* Length */}
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[0.7rem] font-medium text-slate-700">
                    Length
                  </span>
                  <span className="text-[0.65rem] text-slate-400">
                    {currentToolConfig.lengths.find((l) => l.value === lengthKey)?.hint ||
                      ''}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {currentToolConfig.lengths.map((len) => {
                    const active = lengthKey === len.value;
                    return (
                      <button
                        key={len.value}
                        type="button"
                        onClick={() => setLengthKey(len.value)}
                        className={`rounded-full px-2.5 py-1.5 text-[0.7rem] font-medium transition-all ${
                          active
                            ? 'bg-sky-600 text-white shadow-sm shadow-sky-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {len.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tone */}
              <div className="flex-1">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[0.7rem] font-medium text-slate-700">
                    Tone
                  </span>
                  <span className="text-[0.65rem] text-slate-400">
                    Academic vs human tone
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setTone('academic')}
                    className={`rounded-full px-2.5 py-1.5 text-[0.7rem] font-medium transition-all ${
                      tone === 'academic'
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    🎓 Academic / Formal
                  </button>
                  <button
                    type="button"
                    onClick={() => setTone('casual')}
                    className={`rounded-full px-2.5 py-1.5 text-[0.7rem] font-medium transition-all ${
                      tone === 'casual'
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    😀 Casual / Human
                  </button>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-500 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-blue-200 transition-all hover:from-sky-400 hover:via-blue-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Content
                </>
              )}
            </button>

            <p className="mt-2 text-[0.68rem] text-slate-400">
              Built for Depth, Speed & Clarity . Fueled by Advanced Language Models
            </p>
          </div>
        </section>

        {/* Right: output viewer */}
        <section className="w-full lg:w-[58%]">
          <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            {/* Floating stats bar */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-sky-600 shadow-sm">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div>
                  <div className="font-semibold">
                    {toolUsed ? TOOL_CONFIG[toolUsed].label : 'Output'}
                  </div>
                  <div className="text-[0.7rem] text-slate-500">
                    {toolUsed
                      ? TOOL_CONFIG[toolUsed].description
                      : 'Generated content will appear here.'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] text-slate-600 shadow-sm">
                  {wordLabel}
                </span>
                <span className="rounded-full bg-white px-2.5 py-1 text-[0.7rem] text-slate-600 shadow-sm">
                  Tone:{' '}
                  {tone === 'academic' ? 'Academic / Formal' : 'Casual / Human'}
                </span>
              </div>
            </div>

            {/* Output area */}
            <div
              ref={outputRef}
              className="relative min-h-[260px] rounded-xl border border-slate-200 bg-white px-4 py-4 text-sm leading-relaxed text-slate-900"
            >
              {/* Actions */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                  Generated Content
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopy}
                    disabled={!content}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[0.7rem] text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadTxt}
                    disabled={!content}
                    className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[0.7rem] text-slate-700 transition-all hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Download className="h-3.5 w-3.5" />
                    .txt
                  </button>
                </div>
              </div>

              {/* Content / empty / loading state */}
              {!content && !loading && (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-slate-400">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-50 border border-slate-200">
                    <Sparkles className="h-5 w-5 text-sky-500" />
                  </div>
                  <p className="text-sm font-medium text-slate-800">
                    Your writing will appear here.
                  </p>
                  <p className="max-w-xs text-xs text-slate-500">
                    Select a tool on the left, describe your topic, then click{' '}
                    <span className="font-semibold text-sky-600">Generate Content</span>.
                  </p>
                </div>
              )}

              {loading && (
                <div className="space-y-3">
                  <div className="h-3 w-2/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-5/6 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-4/5 animate-pulse rounded bg-slate-100" />
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                </div>
              )}

              {!loading && content && (
                <div className="space-y-3 text-[0.9rem] leading-relaxed">
                  {content.split('\n').map((para, idx) => (
                    <p key={idx} className="whitespace-pre-wrap">
                      {para}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {/* Footer note */}
            <div className="mt-3 flex items-center justify-between text-[0.68rem] text-slate-400">
              <span>
                Your Ideas, Enhanced by Intelligent Writing Systems. For Students, Professionals & Creators
              </span>
              <span>Model: OpenAI · gpt-4o-mini</span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
