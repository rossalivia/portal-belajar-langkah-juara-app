"use client";

import React from "react";

/**
 * RichTextRenderer: Merender format teks tugas (Markdown ringan) secara aman dan elegan.
 * Mendukung heading (## ), list (- atau 1.), blockquote (> ), bold (**), italic (*), dan inline code (`).
 */
export default function RichTextRenderer({ content = "", className = "" }) {
  if (!content) return null;

  const lines = content.split("\n");

  const parseInline = (text) => {
    // Split berdasarkan token bold, italic, inline code
    const parts = [];
    let remaining = text;
    let keyIdx = 0;

    // Sederhana dan aman: parse inline elements
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }

      const matchStr = match[0];
      if (matchStr.startsWith("**") && matchStr.endsWith("**")) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-900">
            {matchStr.slice(2, -2)}
          </strong>
        );
      } else if (matchStr.startsWith("*") && matchStr.endsWith("*")) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800">
            {matchStr.slice(1, -1)}
          </em>
        );
      } else if (matchStr.startsWith("`") && matchStr.endsWith("`")) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-xs text-blue-700 border border-slate-200"
          >
            {matchStr.slice(1, -1)}
          </code>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className={`space-y-2 text-xs leading-relaxed text-slate-700 ${className}`}>
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-xs font-bold text-slate-900 pt-1">
              {parseInline(trimmed.replace(/^###\s+/, ""))}
            </h4>
          );
        }

        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-sm font-bold text-slate-900 pt-1.5 pb-0.5 border-b border-slate-200/60">
              {parseInline(trimmed.replace(/^##\s+/, ""))}
            </h3>
          );
        }

        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-base font-extrabold text-slate-900 pt-2 pb-1 border-b border-slate-200">
              {parseInline(trimmed.replace(/^#\s+/, ""))}
            </h2>
          );
        }

        if (trimmed.startsWith("> ")) {
          return (
            <blockquote
              key={idx}
              className="pl-3 py-1 my-1 border-l-3 border-blue-500 bg-blue-50/50 rounded-r-md text-slate-700 italic"
            >
              {parseInline(trimmed.replace(/^>\s+/, ""))}
            </blockquote>
          );
        }

        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="text-blue-500 font-bold shrink-0">•</span>
              <span>{parseInline(trimmed.replace(/^[-*]\s+/, ""))}</span>
            </div>
          );
        }

        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (orderedMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2">
              <span className="font-semibold text-slate-600 shrink-0">{orderedMatch[1]}.</span>
              <span>{parseInline(orderedMatch[2])}</span>
            </div>
          );
        }

        if (trimmed === "") {
          return <div key={idx} className="h-1.5" />;
        }

        return <p key={idx}>{parseInline(line)}</p>;
      })}
    </div>
  );
}
