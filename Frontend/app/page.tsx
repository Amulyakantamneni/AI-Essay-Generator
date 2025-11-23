'use client';

import { useState } from 'react';
import { Sparkles, FileText, Download, Copy, CheckCircle, Zap, Brain, Search } from 'lucide-react';

export default function EssayWriter() {
  const [topic, setTopic] = useState('');
  const [wordLength, setWordLength] = useState('');
  const [includePdf, setIncludePdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = 'https://ai-essay-generator-2.onrender.com';  // ← UPDATED THIS LINE

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic!');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/generate-essay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic.trim(),
          pdf: includePdf,
          word_length: wordLength ? parseInt(wordLength) : null,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setError(error?.message || 'Failed to generate essay. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };
