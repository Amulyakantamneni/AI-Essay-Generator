'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';

type WritingType =
  | 'essay'
  | 'report'
  | 'summary'
  | 'explanation'
  | 'audit'
  | 'article'
  | 'social_post';

export default function AIWriter() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
  const [tone, setTone] = useState<'academic/formal' | 'casual/humanized'>('academic/formal');
  const [writingType, setWritingType] = useState<WritingType>('essay');
  const [output, setOutput] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://ai-essay-generator-2.onrender.com';

  // Scroll to output when content is generated
  useEffect(() => {
    if (output && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [output]);

  const generateWriting = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setOutput('');
    setSources([]);
    setWordCount(0);

    try {
      const response = await fetch(`${API_URL}/generate-essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          length,
          tone,
          writing_type: writingType, 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setOutput(data.essay);
      setWordCount(data.word_count);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to generate content. ${
          err instanceof Error ? err.message : 'Unknown error'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    if (!output) return;
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const safeTitle = topic || 'AI Writer Output';
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${safeTitle}</title>
        <style>
          body {
            font-family: 'Georgia', serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 40px auto;
            padding: 20px;
            color: #333;
          }
          h1 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 28px;
          }
          .meta {
            color: #666;
            font-size: 14px;
            margin-bottom: 30px;
            padding-bottom: 15px;
            border-bottom: 2px solid #e5e7eb;
          }
          .content {
            white-space: pre-wrap;
            font-size: 16px;
            line-height: 1.8;
          }
          .sources {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
          }
          .sources h2 {
            color: #1e40af;
            font-size: 20px;
            margin-bottom: 15px;
          }
          .sources ul {
            list-style-position: inside;
          }
          .sources li {
            margin-bottom: 8px;
            color: #555;
          }
          @media print {
            body { margin: 0; padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${safeTitle}</h1>
        <div class="meta">
          <strong>Writing Type:</strong> ${writingType} |
          <strong>Word Count:</strong> ${wordCount} |
          <strong>Length:</strong> ${length} |
          <strong>Tone:</strong> ${tone}
        </div>
        <div class="content">${output}</div>
        ${
          sources.length > 0
            ? `
          <div class="sources">
            <h2>Sources</h2>
            <ul>
              ${sources.map((s) => `<li>${s}</li>`).join('')}
            </ul>
          </div>
        `
            : ''
        }
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const downloadAsText = () => {
    if (!output) return;
    const file = new Blob([output], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `ai-writer-${topic.substring(0, 20) || 'output'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const writingTypeLabel = (type: WritingType) => {
    switch (type) {
      case 'essay':
        return 'Essay';
      case 'report':
        return 'Report';
      case 'summary':
        return 'Summary';
      case 'explanation':
        return 'Explain';
      case 'audit':
        return 'Audit';
      case 'article':
        return 'Article';
      case 'social_post':
        return 'Social Post';
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-blue-900 bg-clip-text text-transparent">
                AI Writer
              </h1>
              <p className="text-sm text-gray-600">
                Essays, reports, summaries, articles, explanations, audits & social posts from one topic.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Input Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Generate Your Writing
          </h2>

          {/* Topic Input */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700">
              Topic / Prompt
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic or prompt (e.g., The impact of AI on education)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={4}
            />
          </div>

          {/* Writing Type Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Writing Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(
                [
                  'essay',
                  'report',
                  'summary',
                  'explanation',
                  'audit',
                  'article',
                  'social_post',
                ] as WritingType[]
              ).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setWritingType(type)}
                  className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                    writingType === type
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  {writingTypeLabel(type)}
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  value: 'academic/formal' as const,
                  label: 'Academic / Formal',
                  icon: '🎓',
                },
                {
                  value: 'casual/humanized' as const,
                  label: 'Casual / Humanized',
                  icon: '💬',
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setTone(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tone === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="font-semibold text-sm">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Length Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'short' as const, label: 'Short', words: '150–300 words' },
                { value: 'medium' as const, label: 'Medium', words: '400–700 words' },
                { value: 'long' as const, label: 'Long', words: '800–1200 words' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setLength(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    length === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.words}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={generateWriting}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generate {writingTypeLabel(writingType)}
              </>
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900">Multi-format Writing</div>
            <div className="text-sm text-gray-600 mt-1">
              Essays, reports, audits, summaries & more.
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900">Tone Control</div>
            <div className="text-sm text-gray-600 mt-1">
              Academic or casual, you decide.
            </div>
          </div>
        </div>

        {/* Output */}
        {output && (
          <div ref={outputRef} className="space-y-6 scroll-mt-8">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Your {writingTypeLabel(writingType)}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                  <button
                    onClick={downloadAsPDF}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
                    title="Download as PDF"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">PDF</span>
                  </button>
                  <button
                    onClick={downloadAsText}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all flex items-center gap-2"
                    title="Download as text"
                  >
                    <Download className="w-5 h-5" />
                    <span className="font-semibold">TXT</span>
                  </button>
                </div>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700 font-semibold">
                  Word Count: {wordCount} • Type: {writingTypeLabel(writingType)} • Tone:{' '}
                  {tone}
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {output}
                </div>
              </div>
            </div>

            {sources.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Sources</h3>
                <ul className="space-y-2">
                  {sources.map((source, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-semibold">{index + 1}.</span>
                      <span className="text-gray-700">{source}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>Powered by OpenAI GPT-4.1-mini • AI Writer</p>
          <p className="mt-2">
            Backend:{' '}
            <a
              href={API_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {API_URL}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
