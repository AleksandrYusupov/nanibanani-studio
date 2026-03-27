import axios from 'axios'
import type { Conversation, Message, SendMessageResponse } from '@/types'

const api = axios.create({
  baseURL: '/api',
})

// Conversations
export async function getConversations(): Promise<Conversation[]> {
  const { data } = await api.get('/conversations')
  return data
}

export async function createConversation(model: string, title?: string): Promise<Conversation> {
  const { data } = await api.post('/conversations', { model, title })
  return data
}

export async function updateConversation(
  id: string,
  updates: { title?: string; model?: string }
): Promise<Conversation> {
  const { data } = await api.patch(`/conversations/${id}`, updates)
  return data
}

export async function deleteConversation(id: string): Promise<void> {
  await api.delete(`/conversations/${id}`)
}

// Messages
export async function getMessages(conversationId: string): Promise<Message[]> {
  const { data } = await api.get(`/conversations/${conversationId}/messages`)
  return data
}

export async function sendMessage(
  conversationId: string,
  text: string,
  files: File[],
  settings: { quality: string; aspect_ratio: string; thinking_mode?: string | null }
): Promise<SendMessageResponse> {
  const formData = new FormData()
  formData.append('text', text)
  formData.append('quality', settings.quality)
  formData.append('aspect_ratio', settings.aspect_ratio)
  if (settings.thinking_mode) {
    formData.append('thinking_mode', settings.thinking_mode)
  }
  files.forEach((file) => formData.append('files', file))

  const { data } = await api.post(
    `/conversations/${conversationId}/messages`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
  return data
}

// Files
export function getFileUrl(attachmentId: string): string {
  return `/api/files/${attachmentId}`
}

export function getThumbnailUrl(attachmentId: string, size = 400): string {
  return `/api/files/${attachmentId}/thumbnail?size=${size}`
}
