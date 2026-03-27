export interface Attachment {
  id: string
  type: 'upload' | 'generated'
  mime_type: string
  filename: string
  size_bytes: number | null
  width: number | null
  height: number | null
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  role: 'user' | 'assistant'
  text_content: string | null
  model_used: string | null
  quality: string | null
  aspect_ratio: string | null
  thinking_mode: string | null
  generation_time_ms: number | null
  created_at: string
  attachments: Attachment[]
}

export interface Conversation {
  id: string
  title: string
  model: string
  created_at: string
  updated_at: string
}

export interface SendMessageResponse {
  user_message: Message
  assistant_message: Message
}

export type ModelKey = 'nanibanani-pro' | 'nanibanani-2'
export type Quality = '1K' | '2K' | '4K'
export type ThinkingMode = 'minimal' | 'long'

export const ASPECT_RATIOS = [
  '1:1', '2:3', '3:2', '3:4', '4:3', '4:5', '5:4', '9:16', '16:9', '21:9',
] as const

export type AspectRatio = (typeof ASPECT_RATIOS)[number]

export const MODEL_LABELS: Record<ModelKey, string> = {
  'nanibanani-pro': 'NaniBanani Pro',
  'nanibanani-2': 'NaniBanani 2',
}
