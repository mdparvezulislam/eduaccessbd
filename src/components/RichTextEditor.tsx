"use client";

import React, { useRef, useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onPickImage: () => Promise<string | null>;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  onPickImage,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [selectedRange, setSelectedRange] = useState<Range | null>(null);

  // Track selection inside editor
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection) return;
      if (editorRef.current && editorRef.current.contains(selection.anchorNode)) {
        if (selection.rangeCount > 0) {
          setSelectedRange(selection.getRangeAt(0));
        }
      }
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  const restoreSelection = useCallback(() => {
    if (!selectedRange) return false;
    const selection = window.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(selectedRange);
    return true;
  }, [selectedRange]);

  const applyFormat = useCallback(
    (command: string, value?: string) => {
      if (!restoreSelection()) return;
      document.execCommand(command, false, value);
      if (editorRef.current) onChange(editorRef.current.innerHTML);
      editorRef.current?.focus();
    },
    [onChange, restoreSelection]
  );

  const handleInsertImage = useCallback(async () => {
    const url = await onPickImage();
    if (!url) return;
    if (!restoreSelection()) return;
    const img = `<img src="${url}" alt="blog image" style="max-width:100%; height:auto; display:block; margin:8px 0;" />`;
    applyFormat("insertHTML", img);
  }, [applyFormat, onPickImage, restoreSelection]);

  const handleCreateLink = useCallback(() => {
    const url = prompt("Enter the URL for the link:");
    if (!url) return;
    if (!restoreSelection()) return;
    applyFormat("createLink", url);
  }, [applyFormat, restoreSelection]);

  const handleInput = useCallback(() => {
    if (!editorRef.current) return;
    onChange(editorRef.current.innerHTML);
  }, [onChange]);

  // ✅ Only update innerHTML if it's truly different (prevents cursor jump)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-[#0a0a0a]">
      {/* Toolbar */}
      <div className="p-2 border-b border-white/10 flex flex-wrap gap-1.5 items-center bg-[#141414]">
        <Button type="button" variant="ghost" size="sm" onClick={() => applyFormat("bold")} title="Bold" className="h-7 w-7 p-0 text-xs font-bold text-white hover:bg-white/10">B</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => applyFormat("italic")} title="Italic" className="h-7 w-7 p-0 text-xs italic font-serif text-white hover:bg-white/10">I</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => applyFormat("underline")} title="Underline" className="h-7 w-7 p-0 text-xs underline text-white hover:bg-white/10">U</Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleCreateLink} title="Link" className="h-7 w-7 p-0 text-xs text-blue-400 hover:bg-white/10">🔗</Button>
        <Button type="button" variant="ghost" size="sm" onClick={handleInsertImage} title="Image" className="h-7 w-7 p-0 text-xs text-pink-400 hover:bg-white/10">🖼️</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => applyFormat("insertOrderedList")} title="Ordered List" className="h-7 w-7 p-0 text-xs font-mono text-white hover:bg-white/10">1.</Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => applyFormat("insertUnorderedList")} title="Unordered List" className="h-7 w-7 p-0 text-xs font-mono text-white hover:bg-white/10">•</Button>
      </div>

      {/* Editable content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 outline-none text-xs sm:text-sm text-gray-200 leading-relaxed prose prose-invert max-w-none focus:ring-1 focus:ring-emerald-500/50"
      />
    </div>
  );
};

export default RichTextEditor;
                