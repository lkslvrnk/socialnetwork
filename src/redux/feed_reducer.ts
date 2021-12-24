import { ThunkAction } from "redux-thunk"
import HttpStatusCode from "../api/HttpStatusCode"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { PostType } from "../types/types"
import { feedAPI } from "../api/feed_api"

const SET_POSTS = 'connections/SET-POSTS'

let initialState = {
  posts: null as Array<PostType> | null,
  cursor: null as string | null
}

const feedReducer = (state: InitialStateType = initialState, action: any): InitialStateType => {
  switch (action.type) {
    case SET_POSTS:
      console.log(action)
      return {...state, posts: action.posts, cursor: action.cursor}
    default:
      return state;
  }
}

const actions = {
  setPosts: (posts: Array<PostType>, cursor: string | null) => (
    { type: SET_POSTS, posts, cursor} as const
  ),
}

export let getFeedPosts = (count: number | null): ThunkType => {
  return async (dispatch) => {
    let response = await feedAPI.getFeedPosts(count, null)

    if(response.status === HttpStatusCode.OK) {
      const responseData = response.data
      dispatch(actions.setPosts(responseData.items, responseData.cursor))
    }
  }
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default feedReducer
