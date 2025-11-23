'use client';

import { useState } from 'react';
import { Sparkles, FileText, Download, Copy, CheckCircle, Zap, Brain, Search } from 'lucide-react';

interface EssayResult {
  topic: string;
  summary: string;
  insights: string;
  essay: string;
  pdf_base64?: string;
}

export default function EssayWriter() {
  const [topic, setTopic] = useState('');
  const [wordLength, setWordLength] = useState('');
  const [includePdf, setIncludePdf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EssayResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const API_URL = 'https://ai-essay-generator-2.onrender.com'; // UPDATE THIS

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

      const data: EssayResult = await response.json();
      setResult(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to generate essay. Please try again.';
      setError(message);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.essay) {
      navigator.clipboard.writeText(result.essay);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    if (result?.pdf_base64) {
      const link = document.createElement('a');
      link.href = `data:application/pdf;base64,${result.pdf_base64}`;
      link.download = 'essay.pdf';
      link.click();
    }
  };

  // ... rest of your JSX (keep everything below this the same)
  return (
    // Your existing JSX here
  );
}
