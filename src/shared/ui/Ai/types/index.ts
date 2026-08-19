/* =========================================================
   🔹 MESSAGE TYPES
========================================================= */

export type MessageRole = "user" | "assistant" | "system";

export type MessageStatus = "sending" | "sent" | "error";

export interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  preview?: string;
  metadata?: Record<string, unknown>;
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;

  createdAt?: number;
  status?: MessageStatus;

  isStreaming?: boolean;
  error?: string;
  attachments?: Attachment[];
}

/* =========================================================
   🔹 CHAT STATE
========================================================= */

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}

/* =========================================================
   🔹 ACTION PAYLOADS
========================================================= */

export interface SendMessagePayload {
  content: string;
  attachments?: Attachment[];
}

/* =========================================================
   🔹 STREAMING STATE
========================================================= */

export interface StreamingState {
  isStreaming: boolean;
  streamingMessageId?: string;
}

/* =========================================================
   🔹 CHAT ACTIONS
========================================================= */

export interface ChatActions {
  sendMessage: (payload: SendMessagePayload) => Promise<void>;
  stopStreaming: () => void;
  clearChat: () => void;
  removeMessage: (id: string) => void;
}

/* =========================================================
   🔹 UI TYPES
========================================================= */

export type AiStyleConfig = {
  sidebar?: {
    bg?: string;
    border?: string;
  };
  header?: {
    bg?: string;
    text?: string;
    subtitle?: string;
    border?: string;
  };
  chatArea?: {
    bg?: string;
  };
  message?: {
    user?: {
      bg?: string;
      text?: string;
    };
    assistant?: {
      bg?: string;
      text?: string;
      border?: string;
    };
  };
  input?: {
    bg?: string;
    border?: string;
    textareaBg?: string;
  };
};

export interface AiChatProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  initialMessages?: Message[];
  systemContext?: string;
  suggestions?: AiSuggestion[];
  title?: string;
  subtitle?: string;
  styleConfig?: AiStyleConfig;
}

export interface AiSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  resizable?: boolean;
  side?: "left" | "right";
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
  styleConfig?: AiStyleConfig;
}

export interface AiSidebarHeaderProps {
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  showClose?: boolean;
  styleConfig?: AiStyleConfig;
}

export interface AiSuggestion {
  id: string;
  label: string;
  icon?: string;
  action: string;
}

export interface AiChatAreaProps {
  messages: Message[];
  isTyping: boolean;
  suggestions?: AiSuggestion[];
  onSuggestionClick?: (suggestion: AiSuggestion) => void;
  onScrollToBottom?: () => void;
  styleConfig?: AiStyleConfig;
}

export interface AiChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isTyping: boolean;
  placeholder?: string;
  onAttach?: (files: FileList) => void;
  attachments?: Attachment[];
  onRemoveAttachment?: (id: string) => void;
  onStop?: () => void;
  styleConfig?: AiStyleConfig;
}
