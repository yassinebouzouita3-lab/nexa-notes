import "react-quill-new/dist/quill.snow.css";
import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import ReactQuill from "react-quill-new";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const TOOLBAR = [
  [{ header: [1, 2, 3, false] }],
  ["bold", "italic", "underline"],
  [{ list: "bullet" }, { list: "ordered" }],
  ["blockquote", "link"],
  ["clean"],
];

/**
 * Rich-text body editor. The value is owned by the parent draft state; the
 * editor only reports changes so autosave can persist them.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  className,
}: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keep the editor in sync when the note identity changes (e.g. navigation).
  useEffect(() => {
    const editor =
      containerRef.current?.querySelector<HTMLElement>(".ql-editor");
    if (editor && editor.innerHTML !== value) {
      editor.innerHTML = value;
    }
  }, [value]);

  return (
    <div
      ref={containerRef}
      data-ocid="note.editor"
      className={cn("rich-text-editor", className)}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        modules={{ toolbar: TOOLBAR }}
      />
    </div>
  );
}
