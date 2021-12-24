import { ProfileType, SubscriptionType } from '../types/types'
import { instance } from './api'

type GetSubscriptionResponseType = {
  subscription: SubscriptionType
}

type GetSubscriptionsResponseType = {
  subscriptions: Array<ProfileType>
  allCount: number
  cursor: string | null
}

type CreateSubscriptionResponseType = {
  id: string
}

type GetDeleteSubscriptionResponseType = {
  message: string
}

export const subscriptionAPI = {
  createSubscription: (targetUserId: string) => {
    return instance.post<CreateSubscriptionResponseType>(`user-subscriptions`, {
      user_id: targetUserId
    })
  },
  getSubscription: (subscriptionId: string) => {
    return instance.get<GetSubscriptionResponseType>(`user-subscriptions/${subscriptionId}`)
  },
  getSubscriptionsfUser: (userId: string, count: number | null, cursor: string | null) => {
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    const countParam = count !== null ? `&count=${count}` : ''
    return instance.get<GetSubscriptionsResponseType>(`/users/${userId}/subscriptions?${countParam}${cursorParam}`)
  },
  deleteSubscription: (subscriptionId: string) => {
    return instance.delete<GetDeleteSubscriptionResponseType>(`user-subscriptions/${subscriptionId}`)
  }
}