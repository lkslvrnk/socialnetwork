import { instance } from './api'

export const dialoguesAPI = {
  getDialogue: (dialogueId: string) => instance.get(`dialogues/${dialogueId}`),
  getDialogues: (ownerId: string, limit: number | null = null, offsetTimestamp: number | null = null) => {
    const limitParam = limit ? `&limit=${limit}` : ''
    const offsetTimestampParam = offsetTimestamp ? `&offset-timestamp=${offsetTimestamp}` : ''
    return instance.get(`dialogues?ownerId=${ownerId}${limitParam}${offsetTimestampParam}`)
  },
  createDialogue: (firstMessage: string, interlocutorId: string, timestamp: number) => {
    return instance.post(
        'dialogues', 
        { interlocutorId: interlocutorId, firstMessage: firstMessage, guiTimestamp: timestamp }
    )
  },
  createMessage: (dialogueId: string, messageText: string, timestamp: number) => {
    instance.post(`dialogues/${dialogueId}/messages`, {messageText: messageText, guiTimestamp: timestamp})
  },
  deleteMessage: (messageID: string) => instance.delete(`messages/${messageID}`),
  getMessagesHistories: (ids: string) => instance.get(`messages-histories?ids=${ids}`),
  getMessagesHistoryMessages: (historyId: string) => instance.get(`messages-histories/${historyId}/messages?count=10`),
  getMessage: (messageId: string) => instance.get(`messages/${messageId}`),
  getMessages: (dialogueId: string, count: number, offset: number) => instance.get(`dialogues/${dialogueId}/messages?count=${count}&offset=${offset}`),
  updateMessage: (messageId: string, fieldsAndValues: []) => instance.patch(`messages/${messageId}`, fieldsAndValues),
  deleteMessageFromHistory: (historyId: string, messageId: string) => instance.delete(`messages-histories/${historyId}/messages/${messageId}`)
}