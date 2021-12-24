import { PostType } from '../types/types'
import { instance } from './api'

type GetFeedResponseType = {
  items: Array<PostType>
  cursor: string | null
}

export const feedAPI = {
  getFeedPosts: (count: number | null, cursor: string | null) => {
    const countParam = count !== null ? `&count=${count}` : ''
    const cursorParam = cursor !== null ? `&cursor=${cursor}` : ''
    return instance.get<GetFeedResponseType>(`/feed?${countParam}${cursorParam}`)
  }
}