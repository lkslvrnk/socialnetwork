import { UserDataType } from '../types/types'
import { AppStateType } from './redux_store'

export const getCurrentUserId = (state: AppStateType) => {
    return state.auth.id
}

export const getCurrentUserUsername = (state: AppStateType) => {
    return state.auth.username
}

export const getCurrentUserPicture = (state: AppStateType) => {
    return state.auth.avatar
}

export const getCurrentUserData = (state: AppStateType) => {
    let authState = state.auth
    return {
        id: authState.id,
        username: authState.username,
        avatar: authState.avatar,
        firstName: authState.firstName,
        lastName: authState.lastName
    }
}

export const getCurrentUserData2 = (state: AppStateType): UserDataType | null => {
    return state.auth.userData
}

export const selectNewRequestsCount = (state: AppStateType): number => {
    return state.auth.newRequestsCount
}