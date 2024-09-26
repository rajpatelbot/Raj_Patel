type SentByType = "ai" | "user";

export interface IChatWithAI {
  sentBy: SentByType;
  message: string;
  timestamp: number;
}
