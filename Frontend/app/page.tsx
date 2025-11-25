'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Loader2, Download, Copy, CheckCircle, AlertCircle } from 'lucide-react';

export default function EssayGenerator() {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState('medium');
  const [tone, setTone] = useState('academic');
  const [essay, setEssay] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [sources, setSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-essay-generator-2.onrender.com';

  // Scroll to output when essay is generated
  useEffect(() => {
    if (essay && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [essay]);

  const generateEssay = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    setEssay('');
    setSources([]);
    setWordCount(0);

    try {
      const response = await fetch(`${API_URL}/generate-essay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, length, tone })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      setEssay(data.essay);
      setWordCount(data.word_count);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(
        `Failed to generate essay. ${err instanceof Error ? err.message : 'Unknown error'}`
      );
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadAsPDF = () => {
    // Create a printable HTML document
    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Essay - ${topic}</title>
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
        <h1>${topic}</h1>
        <div class="meta">
          <strong>Word Count:</strong> ${wordCount} words | 
          <strong>Length:</strong> ${length} | 
          <strong>Tone:</strong> ${tone}
        </div>
        <div class="essay-content">${essay}</div>
        ${sources.length > 0 ? `
          <div class="sources">
            <h2>Sources</h2>
            <ul>
              ${sources.map(source => `<li>${source}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for content to load then trigger print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  const downloadAsText = () => {
    const file = new Blob([essay], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(file);
    element.download = `essay-${topic.substring(0, 20)}.txt`;
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
                AI Essay Writer
              </h1>
              <p className="text-sm text-gray-600">Professional Essay Generation Tool</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Input Section - Centered */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Generate Your Essay</h2>

          {/* Topic Input */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700">
              Essay Topic
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your essay topic (e.g., Climate Change, Artificial Intelligence, World War II)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={4}
            />
          </div>

          {/* Length Selection */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Essay Length
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'short', label: 'Short', words: '300-500 words' },
                { value: 'medium', label: 'Medium', words: '500-800 words' },
                { value: 'long', label: 'Long', words: '800-1200 words' }
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
              Writing Tone
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'academic', label: 'Academic', icon: '🎓' },
                { value: 'casual', label: 'Casual', icon: '💬' },
                { value: 'persuasive', label: 'Persuasive', icon: '✨' }
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
            onClick={generateEssay}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-900 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Essay...
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Generate Essay
              </>
            )}
          </button>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">⚡</div>
            <div className="font-semibold text-gray-900">Fast Generation</div>
            <div className="text-sm text-gray-600 mt-1">Essays in seconds</div>
          </div>
          <div className="bg-white rounded-xl shadow-md border border-blue-100 p-6">
            <div className="text-3xl mb-2">🎯</div>
            <div className="font-semibold text-gray-900">AI-Powered</div>
            <div className="text-sm text-gray-600 mt-1">GPT-4 technology</div>
          </div>
        </div>

        {/* Output Section - Appears below after generation */}
        {essay && (
          <div ref={outputRef} className="space-y-6 scroll-mt-8">
            {/* Essay Output */}
            <div className="bg-white rounded-2xl shadow-xl border border-blue-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                  <h2 className="text-2xl font-bold text-gray-900">Your Essay</h2>
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
                  Word Count: {wordCount} words
                </div>
              </div>

              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {essay}
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
          <p>Powered by OpenAI GPT-4 • Multi-Agent Workflow</p>
          <p className="mt-2">Backend: <a href={API_URL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{API_URL}</a></p>
        </div>
      </div>
    </div>
  );
}
