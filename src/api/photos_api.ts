import { PhotoType } from "../types/types"
import { instance } from "./api"

type GetPhotosResponseType = {
  items: Array<PhotoType>
  totalCount: number
}

export const photosAPI = {
  getAlbum: (albumID: string) => {
    return instance.get(`albums/${albumID}`)
  },
  getAlbums: (userID: string, page: number | null = null, limit: number | null = null) => {
    return instance.get(`users/${userID}/albums`)
  },
  getPhotos: (userID: string, limit: number | null = null, lastPhotoTimestamp: number | null = null) => {
    const lastPhotoTimestampParam = lastPhotoTimestamp
      ? `&last-photo-timestamp=${lastPhotoTimestamp}` : ''
    const limitParam = limit ? `&limit=${limit}` : ''
    const paramsAreExist = lastPhotoTimestampParam || limitParam
    return instance.get<GetPhotosResponseType>(
      `users/${userID}/photos${paramsAreExist && '?'}${limitParam}${lastPhotoTimestampParam}`
      )
  },
  getPhoto: (photoID: string) => instance.get<PhotoType>(`photos/${photoID}`),
  getAlbumPhotos: (albumID: string) => {
    return instance.get(`albums/${albumID}/photos`)
  },
  addPhoto: (image: any, addCreator: string, albumID: string, options: any) => {
    let formData = new FormData()
    formData.append('image', image)
    formData.append('addCreator', addCreator)
    formData.append('albumID', albumID)
    let config = {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    return instance.post<any>(`photos/`, formData, config)
  },
  createCommentPhoto: (photo: any) => {
    let formData = new FormData()
    formData.append('photo', photo)

    let options = {}
    let config = {
      ...options,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
    return instance.post<any>(`user-comment-photos/`, formData, config)
  },
  getCommentPhoto: (photoId: string) => {
    return instance.get<PhotoType>(`user-comment-photos/${photoId}`)
  },
  createPostPhoto: (photo: any, onProgressEvent: any) => {
    let formData = new FormData()
    formData.append('photo', photo)

    let config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgressEvent
    }
    return instance.post<any>(`user-post-photos/`, formData, config)
  },
  getPostPhoto: (photoId: string) => {
    return instance.get<PhotoType>(`user-post-photos/${photoId}`)
  },
}