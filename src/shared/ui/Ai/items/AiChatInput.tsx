import { useRef, useCallback, useEffect } from "react";
import { Send, Square } from "lucide-react";
import { FileAttachment } from "./AiChatArea";
import { aiChatInputStyles } from "../styles/aiSidebar.styles";
import type { AiChatInputProps } from "../types";

export const AiChatInput = ({
  input,
  setInput,
  onSend,
  isTyping,
  placeholder = "Ask something...",
  onAttach,
  attachments = [],
  onRemoveAttachment,
  onStop,
  styleConfig,
}: AiChatInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null); // file picker ref
  const textareaRef = useRef<HTMLTextAreaElement>(null); // textarea ref

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files?.length) {
        onAttach?.(e.target.files); // pass files
        if (fileInputRef.current) fileInputRef.current.value = ""; // reset input
      }
    },
    [onAttach],
  );

  const handleSend = useCallback(() => {
    if (!input.trim() && attachments.length === 0) return; // guard empty
    onSend(); // send message
  }, [input, attachments, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault(); // prevent newline
        handleSend(); // send
      }
    },
    [handleSend],
  );

  // auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto"; // reset height
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`; // grow with limit
  }, [input]);

  return (
    <div
      className={aiChatInputStyles.root}
      style={{
        backgroundColor: styleConfig?.input?.bg,
        borderColor: styleConfig?.input?.border,
      }}
    >
      <div className={aiChatInputStyles.inner}>
        {/* attachments */}
        {attachments.length > 0 && (
          <div className={aiChatInputStyles.attachmentPreview}>
            {attachments.map((file) => (
              <div key={file.id} className="w-48">
                <FileAttachment
                  attachment={file}
                  onRemove={onRemoveAttachment}
                />
              </div>
            ))}
          </div>
        )}

        {/* input */}
        <div className="relative group flex items-center">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)} // update input
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={aiChatInputStyles.textarea}
            style={{ backgroundColor: styleConfig?.input?.textareaBg }}
            rows={1}
            aria-label="Chat input"
          />

          {/* actions */}
          <div className={aiChatInputStyles.actionGroup}>
            {isTyping ? (
              <button
                onClick={onStop} // stop streaming
                className={aiChatInputStyles.stopButton}
                title="Stop generating"
                type="button"
              >
                <Square size={16} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isTyping} // disable invalid send
                className={aiChatInputStyles.sendButton}
                type="button"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            )}
          </div>
        </div>

        {/* hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />
      </div>
    </div>
  );
};
