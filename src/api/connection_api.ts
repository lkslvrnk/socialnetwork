import { ConnectionType, ContactType } from '../types/types'
import { instance } from './api'

type GetConnectionResponseType = {
  connection: ConnectionType
}

type GetConnectionsResponseType = {
  connections: Array<ConnectionType>
  allCount: number
  cursor: string | null
}

type GetContactsResponseType = {
  items: Array<ContactType>
  count: number
  cursor: string | null
}

type CreateConnectionResponseType = {
  id: string,
  subscriptionId: string | null
}

export const connectionAPI = {
  createConnection: (targetUserId: string, subscribe: number) => {
    return instance.post<CreateConnectionResponseType>(`connections`, {
      target_user_id: targetUserId,
      subscribe: subscribe
    })
  },
  getConnection: (connectionId: string) => {
    return instance.get<GetConnectionResponseType>(`connections/${connectionId}`)
  },
  getConnectionsOfUser: (
    userId: string, count: number | null, cursor: string | null,
    type: string | null, hideAccepted: boolean | null,
    hidePending: boolean | null, start: number | null
  ) => {
    const cursorParam = cursor ? `&cursor-id=${cursor}` : ''
    const hideAcceptedParam = hideAccepted ? `&hide-accepted=1` : ''
    const hidePendingParam = hidePending ? `&hide-pending=1` : ''
    const countParam = count !== null ? `&count=${count}` : ''
    const typeParam = type ? `&type=${type}` : ''
    const startParam = start ? `&start=${start}` : ''
    return instance.get<GetConnectionsResponseType>(
      `/users/${userId}/connections?${hideAcceptedParam}${hidePendingParam}${countParam}${cursorParam}${typeParam}${startParam}`
      )
  },
  deleteConnection: (connectionId: string) => {
    return instance.delete(`connections/${connectionId}`)
  },
  acceptConnection: (connectionId: string) => {
    return instance.patch(`accept-connection`, {connection_id: connectionId})
  },
  getUserContacts: (
    userId: string, commonWith: string | null,
    cursor: string | null, count: number | null
  ) => {
    const commonWithParam = commonWith ? `&common-with=${commonWith}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    const countParam = count ? `&count=${count}` : ''
    const hasParams = !!commonWith || !!cursor || !!count

    return instance.get<GetContactsResponseType>(
      `users/${userId}/contacts${hasParams ? `?${commonWithParam}${cursorParam}${countParam}` : ''}`
    )
  }
}