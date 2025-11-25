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
  const [length, setLength] = useState('medium');
  const [tone, setTone] = useState('academic');
  const [writingType, setWritingType] = useState<WritingType>('essay');
  const [content, setContent] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || 'https://ai-essay-generator-2.onrender.com';

  const writingTypeLabel = (type: WritingType) => {
    switch (type) {
      case 'essay':
        return 'Essay';
      case 'report':
        return 'Report';
      case 'summary':
        return 'Summary';
      case 'explanation':
        return 'Explanation';
      case 'audit':
        return 'Audit';
      case 'article':
        return 'Article';
      case 'social_post':
        return 'Social Post';
      default:
        return 'Writing';
    }
  };

  // Scroll to output when content is generated
  useEffect(() => {
    if (content && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [content]);

  const generateWriting = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setContent('');
    setSources([]);
    setWordCount(0);

    try {
      const response = await fetch(`${API_URL}/generate-essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // NOTE: backend expects: topic, length, tone, writing_type
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
      setContent(data.essay);
      setWordCount(data.word_count);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to generate writing. ${
          err instanceof Error ? err.message : 'Unknown error'
        }`,
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    if (!content) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const titleText = `${writingTypeLabel(writingType)} - ${
      topic || 'AI Writer Document'
    }`;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${titleText}</title>
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
          .essay-content {
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
        <h1>${titleText}</h1>
        <div class="meta">
          <strong>Word Count:</strong> ${wordCount} words | 
          <strong>Length:</strong> ${length} | 
          <strong>Tone:</strong> ${tone} |
          <strong>Type:</strong> ${writingTypeLabel(writingType)}
        </div>
        <div class="essay-content">${content}</div>
        ${
          sources.length > 0
            ? `
          <div class="sources">
            <h2>Sources</h2>
            <ul>
              ${sources.map((source) => `<li>${source}</li>`).join('')}
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
    if (!content) return;

    const titlePrefix = writingTypeLabel(writingType).toLowerCase().replace(' ', '-');
    const file = new Blob([content], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `${titlePrefix}-${topic.substring(0, 20) || 'ai-writer'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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
                Multi-format AI writing assistant (Essay, Report, Summary, Article & more)
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Input Section - Centered */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Generate Your Writing
          </h2>

          {/* Topic Input */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700">Topic</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic (e.g., Climate Change, AI in Education, Financial Audits, etc.)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={4}
            />
          </div>

          {/* Writing Type Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Writing Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
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
                  onClick={() => setWritingType(type)}
                  className={`p-3 rounded-xl border-2 text-sm transition-all ${
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

          {/* Length Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'short', label: 'Short', words: '150-300 words' },
                { value: 'medium', label: 'Medium', words: '400-700 words' },
                { value: 'long', label: 'Long', words: '800-1200 words' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setLength(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    length === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold">{option.label}</div>
                  <div className="text-xs text-gray-500 mt-1">{option.words}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Tone
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'academic', label: 'Academic', icon: '🎓' },
                { value: 'casual', label: 'Casual', icon: '💬' },
                { value: 'persuasive', label: 'Persuasive', icon: '✨' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTone(option.value)}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    tone === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="font-semibold text-sm">{option.label}</div>
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
                Generate Writing
              </>
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900">Fast Generation</div>
            <div className="text-sm text-gray-600 mt-1">Content in seconds</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900">Multi-Format AI</div>
            <div className="text-sm text-gray-600 mt-1">
              Essays, reports, summaries, posts & more
            </div>
          </div>
        </div>

        {/* Output Section */}
        {content && (
          <div ref={outputRef} className="space-y-6 scroll-mt-8">
            {/* Output */}
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
                  Word Count: {wordCount} words • Type: {writingTypeLabel(writingType)}
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {content}
                </div>
              </div>
            </div>

            {/* Sources */}
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
          <p>Powered by OpenAI GPT-4 • Multi-format AI Writing Engine</p>
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
