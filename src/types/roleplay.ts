import type {
  RoleplayDifficulty,
  RoleplayMessageSender,
  RoleplaySessionStatus,
} from '@/types/enums';

export interface RoleplayScenario {
  id: string;
  title: string;
  description: string;
  difficulty: RoleplayDifficulty;
  /** Persona the AI plays (e.g. "Barista at a coffee shop"). */
  aiPersona: string;
  /** Suggested opener the user can edit. */
  suggestedOpener?: string;
  /** Estimated turns to reach a meaningful resolution. */
  estimatedTurns: number;
  tags: string[];
  createdAt: string;
}

export interface RoleplayScenariosResponse {
  items: RoleplayScenario[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface StartRoleplaySessionRequest {
  scenarioId: string;
  /** Optional, the user can override the suggested opener here. */
  initialMessage?: string;
}

export interface RoleplayMessage {
  id: string;
  sender: RoleplayMessageSender;
  /** Plain-text message body. */
  text: string;
  /** Optional AI-side correction / explanation block. */
  correction?: string;
  /** Server-issued timestamp. */
  createdAt: string;
}

export interface RoleplaySession {
  id: string;
  scenarioId: string;
  status: RoleplaySessionStatus;
  /** Conversation so far, in chronological order. */
  messages: RoleplayMessage[];
  startedAt: string;
  /** When the user last sent a message. */
  lastActivityAt: string;
}

export interface SendRoleplayMessageRequest {
  sessionId: string;
  text: string;
}

export interface SendRoleplayMessageResponse {
  userMessage: RoleplayMessage;
  /** The AI's reply, generated asynchronously on the server. */
  aiMessage: RoleplayMessage;
}

export interface EndRoleplaySessionRequest {
  sessionId: string;
}

export interface EndRoleplaySessionResponse {
  sessionId: string;
  status: RoleplaySessionStatus;
  /** Aggregate feedback the user sees on the closing screen. */
  summary: {
    turns: number;
    durationSeconds: number;
    /** 0..1 — server's overall judgement of the user's English. */
    proficiency: number;
    feedback: string;
  };
}
