import { profileAPI } from '../api/profile_api'
import {baseUrl} from '../api/api'
import { PhotoType } from '../types/types'
import { ThunkAction } from 'redux-thunk'
import { AppStateType, InferActionsTypes } from './redux_store'
import HttpStatusCode from '../api/HttpStatusCode'
import { photosAPI } from '../api/photos_api'

const SET_ALBUM = 'photos/SET-ALBUM'
const SET_ALBUMS = 'photos/SET-ALBUMS'
const SET_PHOTO = 'photos/SET-PHOTO'
const SET_PHOTOS = 'photos/SET-PHOTOS'
const SET_VIEWER_PHOTOS = 'photos/SET-VIEWER-PHOTOS'
const CLEAN_VIEWER_PHOTOS = 'photos/CLEAN-VIEWER-PHOTOS'
const SET_ALBUM_PHOTOS = 'photos/SET-ALBUM-PHOTOS'
const SET_NEW_PHOTO = 'photos/SET-NEW-PHOTO'
const CLEAN_NEW_PHOTOS = 'photos/CLEAN_NEW_PHOTOS'
const SET_NEW_PHOTO_CREATING = 'photos/SET-NEW-PHOTO-CREATING'

type AlbumType = {
  id: string
  name: string
  creatorId: string | null
  creatorName: string | null
  creatorAvatar: string | null
  photos: Array<PhotoType>
}

let initialState = {
  album: null as AlbumType | null,
  albums: [] as Array<AlbumType>,
  albumsAreLoaded: false,
  photos: [] as Array<PhotoType>,
  photosAreLoaded: false,
  viewerPhotos: [] as Array<PhotoType>,
  viewerPhotosAreLoaded: false,
  albumPhotos: [] as Array<PhotoType>,
  albumPhotosAreLoaded: false,
  newPhotos: [] as Array<PhotoType>,
  newPhotoCreating: false,
  totalPhotosCount: null as number | null
}

const photosReducer = (
  state: InitialStateType = initialState,
  action: ActionsType
): InitialStateType => {
  switch (action.type) {
    case SET_ALBUM:
      action.photos.forEach(photo => photo.src = `${baseUrl}/images/${photo.src}`)
      return { ...state, album: action.album, albumPhotos: action.photos }
    case SET_ALBUMS:
      return { ...state, albumsAreLoaded: true, albums: action.albums }
    case SET_NEW_PHOTO:
      action.photo.src = `${baseUrl}/images/${action.photo.src}`
      return { ...state, newPhotos: [...state.newPhotos, action.photo] }
    case CLEAN_NEW_PHOTOS:
      return { ...state, newPhotos: [] }
    case SET_NEW_PHOTO_CREATING:
      return { ...state,  newPhotoCreating: action.value }
    case SET_PHOTO:
      action.photo.src = `${baseUrl}/images/${action.photo.src}`
      return { ...state, photos: [...state.photos, action.photo] }
    case SET_PHOTOS:
      action.photos.forEach(photo => {
        photo.src = `${baseUrl}/images/${photo.src}`
        state.photos.push(photo)
      })
      
      return {
        ...state, photosAreLoaded: true, photos: [...state.photos],
        totalPhotosCount: action.totalCount
      }
    case SET_ALBUM_PHOTOS:
      action.photos.forEach(photo => photo.src = `${baseUrl}/images/${photo.src}`)
      return { ...state, albumPhotosAreLoaded: true, albumPhotos: action.photos }
    case SET_VIEWER_PHOTOS:
      action.photos.forEach(photo => photo.src = `${baseUrl}/images/${photo.src}`)
      return { ...state, viewerPhotosAreLoaded: true, viewerPhotos: action.photos }
      case CLEAN_VIEWER_PHOTOS:
        return { ...state, viewerPhotosAreLoaded: false, viewerPhotos: [] }
    default:
      return state
  }
}

const actions = {
  cleanViewerPhotos: () => ({ type: CLEAN_VIEWER_PHOTOS } as const),
  setAlbums: (albums: Array<AlbumType>) => ({
    type: SET_ALBUMS, albums: albums
  } as const),
  setPhotos: (photos: Array<PhotoType>, totalCount: number) => ({
    type: SET_PHOTOS, photos, totalCount
  } as const),
  setPhoto: (photo: PhotoType) => ({ type: SET_PHOTO, photo } as const),
  setAlbum: (album: AlbumType, photos: Array<PhotoType>) => ({
    type: SET_ALBUM, album, photos
  } as const),
  setNewPhotoCreating: (value: boolean) => ({
    type: SET_NEW_PHOTO_CREATING, value
  } as const),
  cleanNewPhotos: () => ({ type: CLEAN_NEW_PHOTOS } as const),
  setNewPhoto: (photo: PhotoType) => ({
    type: SET_NEW_PHOTO, photo
  } as const),
  setAlbumPhotos: (photos: Array<PhotoType>) => ({
    type: SET_ALBUM_PHOTOS, photos
  } as const),
  setViewerPhotos: (photos: Array<PhotoType>) => ({
    type: SET_VIEWER_PHOTOS, photos
  } as const)
}

export let cleanViewerPhotos = (): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.cleanViewerPhotos())
  }
}

export let cleanNewPhotos = (): ThunkType => {
  return async (dispatch) => {
    dispatch(actions.cleanNewPhotos())
  }
}

export let addPhoto = (
  file: any, addCreator: string, albumID: string, options: any
): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.addPhoto(file, addCreator, albumID, options)
    
    if(response.status === HttpStatusCode.CREATED) {
      let newPhotoResponse = await photosAPI.getPhoto(response.data.id)

      if(newPhotoResponse.status === HttpStatusCode.OK) {
        dispatch(actions.setNewPhoto(newPhotoResponse.data))
      }
    }
    return response
  }
}

export let getAlbums = (
  userId: string, limit: number | null = null, page: number | null = null
): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getAlbums(userId, page, limit)
    if(response.status === HttpStatusCode.OK) {
      dispatch(actions.setAlbums(response.data.items));
    }
    return response
  }
}

export let getAlbum = (albumID: string): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getAlbum(albumID)
    if(response.status === HttpStatusCode.OK) {
      let photosResponse = await photosAPI.getAlbumPhotos(albumID)
      if(photosResponse.status === HttpStatusCode.OK) {
        dispatch(actions.setAlbum(response.data.album, photosResponse.data.items))
      }
    }
    return response
  }
}

export let getProfilePhotosForViewer = (
  userId: string, limit: number | null = null, page: number | null = null
): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getPhotos(userId, limit)
    if(response.status === HttpStatusCode.OK) {
      dispatch(actions.setViewerPhotos(response.data.items));
    }
    return response
  }
}

export let getAlbumPhotos = (albumID: string): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getAlbumPhotos(albumID)
    if(response.status === HttpStatusCode.OK) {
      dispatch(actions.setViewerPhotos(response.data.items));
    }
    return response
  }
}

export let getPhotos = (
  userId: string, limit: number | null = null,
  lastPhotoTimestamp: number | null = null
): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getPhotos(userId, limit, lastPhotoTimestamp)
    if(response.status === HttpStatusCode.OK) {
      dispatch(actions.setPhotos(response.data.items, response.data.totalCount));
    }
    return response
  }
}

export let getPhoto = (photoId: string): ThunkType => {
  return async (dispatch) => {
    let response = await photosAPI.getPhoto(photoId)
    if(response.status === HttpStatusCode.OK) {
      dispatch(actions.setPhoto(response.data));
    }
    return response
  }
}

export let getPostPhotos = (postID: string): ThunkType => {
  return async (dispatch) => {
    let response = await profileAPI.getPost(postID)
    return response
  }
}

type ActionsType = InferActionsTypes<typeof actions>
type InitialStateType = typeof initialState
type ThunkType = ThunkAction<Promise<any>, AppStateType, unknown, ActionsType>

export default photosReducer