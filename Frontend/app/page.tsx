'use client';

import React, { useState } from 'react';
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

  // Backend API URL - Update this to your backend URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-essay-generator-2.onrender.com';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          length: length,
          tone: tone
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEssay(data.essay);
      setWordCount(data.word_count);
      setSources(data.sources || []);
    } catch (err) {
      console.error('Error:', err);
      setError(`Failed to generate essay. Please check if the backend is running. Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(essay);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadEssay = () => {
    const element = document.createElement('a');
    const file = new Blob([essay], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `essay-${topic.substring(0, 20)}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI Essay Writer
              </h1>
              <p className="text-sm text-gray-600">by Amulya</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Generate Your Essay</h2>

              {/* Topic Input */}
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-semibold text-gray-700">
                  Essay Topic
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Enter your essay topic (e.g., Climate Change, Artificial Intelligence, World War II)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-all"
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
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
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
                          ? 'border-purple-500 bg-purple-50 text-purple-700'
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
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-semibold text-gray-900">Fast Generation</div>
                <div className="text-sm text-gray-600 mt-1">Essays in seconds</div>
              </div>
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <div className="text-3xl mb-2">🎯</div>
                <div className="font-semibold text-gray-900">AI-Powered</div>
                <div className="text-sm text-gray-600 mt-1">GPT-4 technology</div>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="space-y-6">
            {essay ? (
              <>
                {/* Essay Output */}
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-6 h-6 text-green-500" />
                      <h2 className="text-2xl font-bold text-gray-900">Your Essay</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Copy className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={downloadEssay}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download essay"
                      >
                        <Download className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                    <div className="text-sm text-indigo-700 font-semibold">
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
                  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Sources</h3>
                    <ul className="space-y-2">
                      {sources.map((source, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-indigo-600 font-semibold">{index + 1}.</span>
                          <span className="text-gray-700">{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="text-6xl mb-4">✍️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Ready to Generate
                </h3>
                <p className="text-gray-600">
                  Enter your essay topic and click &quot;Generate Essay&quot; to get started
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-sm text-gray-500">
          <p>Powered by OpenAI GPT-4 • Multi-Agent Workflow</p>
          <p className="mt-2">Backend: <a href={API_URL} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{API_URL}</a></p>
        </div>
      </div>
    </div>
  );
}
