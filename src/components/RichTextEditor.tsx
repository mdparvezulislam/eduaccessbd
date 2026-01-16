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
    <div className="border rounded-md">
      {/* Toolbar */}
      <div className="p-2 border-b flex flex-wrap gap-2 items-center bg-gray-50">
        <Button type="button" onClick={() => applyFormat("bold")} title="Bold">B</Button>
        <Button type="button" onClick={() => applyFormat("italic")} title="Italic">I</Button>
        <Button type="button" onClick={() => applyFormat("underline")} title="Underline">U</Button>
        <Button type="button" onClick={handleCreateLink} title="Link">🔗</Button>
        <Button type="button" onClick={handleInsertImage} title="Image">🖼️</Button>
        <Button type="button" onClick={() => applyFormat("insertOrderedList")} title="Ordered List">1.</Button>
        <Button type="button" onClick={() => applyFormat("insertUnorderedList")} title="Unordered List">•</Button>
      </div>

      {/* Editable content */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[200px] p-4 outline-none focus:ring-2 focus:ring-blue-500 prose max-w-none"
      />
    </div>
  );
};

export default RichTextEditor;
                