import { profileAPI } from "../../api/profile_api"
import { InferActionsTypes } from "../../redux/redux_store"
import { ConnectionType, ContactType, ProfileType } from "../../types/types"

export const CLEAN = 'CLEAN'
export const SET_ACCEPTED_CONNS = 'SET-ACCEPTED-CONNS'
export const ADD_ACCEPTED_CONNS = 'ADD-ACCEPTED-CONNS'
export const SET_INCOMING_CONNS = 'SET-INCOMING-CONNS'
export const ADD_INCOMING_CONNS = 'ADD-INCOMING-CONNS'
export const SET_OUTGOING_CONNS = 'SET-OUTGOING-CONNS'
export const ADD_OUTGOING_CONNS = 'ADD-OUTGOING-CONNS'
export const SET_COMMON_CONTACTS = 'SET-COMMON-CONTACTS'
export const SET_ACCEPTED_CONNS_COUNT = 'SET-ACCEPTED-CONNS-COUNT'
export const SET_INCOMING_CONNS_COUNT = 'SET-INCOMING-CONNS-COUNT'
export const SET_OUTGOING_CONNS_COUNT = 'SET-OUTGOING-CONNS-COUNT'
export const ACCEPT = 'ACCEPT'
export const DELETE_OUTGOING = 'DELETE-OUTGOING'
export const DELETE_INCOMING = 'DELETE-INCOMING'
export const DELETE_ACCEPTED = 'DELETE-ACCEPTED'
export const SET_OWNER = 'SET-OWNER'
export const ADD_COMMON_CONTACTS = 'ADD-COMMON-CONTACTS'

export type State = {
  owner: ProfileType | null,
  ownerLoaded: boolean,
  acceptedConns: Array<ConnectionType> | null,
  acceptedConnsCount: number | null,
  acceptedCursor: string | null,
  incomingConns: Array<ConnectionType> | null,
  incomingConnsCount: number | null,
  incomingCursor: string | null,
  outgoingConns: Array<ConnectionType> | null,
  outgoingConnsCount: number | null,
  outgoingCursor: string | null,
  commonContacts: Array<ContactType> | null,
  commonContactsCount: number | null,
  commonContactsCursor: string | null,
}

export const actions = {
  clean: () => ({ type: CLEAN } as const),
  setOwner: (owner: ProfileType | null) => ({
    type: SET_OWNER,
    owner
  } as const),
  accept: (id: string) => ({
    type: ACCEPT,
    id
  } as const),
  deleteOutgoing: (id: string) => ({
    type: DELETE_OUTGOING,
    id
  } as const),
  deleteAccepted: (id: string) => ({
    type: DELETE_ACCEPTED,
    id
  } as const),
  deleteIncoming: (id: string) => ({
    type: DELETE_INCOMING,
    id
  } as const),
  setAcceptedConnections: (
    ownerUsername: string,
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: SET_ACCEPTED_CONNS,
    ownerUsername, connections, allCount, cursor
  } as const),
  addAcceptedConnections: (
    ownerUsername: string,
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: ADD_ACCEPTED_CONNS,
    ownerUsername, connections, allCount, cursor
  } as const),
  setIncomingConnections: (
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: SET_INCOMING_CONNS,
    connections, allCount, cursor
  } as const),
  addIncomingConnections: (
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: ADD_INCOMING_CONNS,
    connections, allCount, cursor
  } as const),
  setOutgoingConnections: (
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: SET_OUTGOING_CONNS,
    connections, allCount, cursor
  } as const),
  addOutgoingConnections: (
    connections: Array<ConnectionType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: ADD_OUTGOING_CONNS,
    connections, allCount, cursor
  } as const),
  setCommonContacts: (
    contacts: Array<ContactType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: SET_COMMON_CONTACTS,
    contacts, allCount, cursor
  } as const),
  addCommonContacts: (
    contacts: Array<ContactType>,
    allCount: number,
    cursor: string | null
  ) => ({
    type: ADD_COMMON_CONTACTS,
    contacts, allCount, cursor
  } as const),
  setAcceptedConnsCount: (count: number) => ({
    type: SET_ACCEPTED_CONNS_COUNT,
    count
  } as const),
  setIncomingConnsCount: (count: number) => ({
    type: SET_INCOMING_CONNS_COUNT,
    count
  } as const),
  setOutgoingConnsCount: (count: number) => ({
    type: SET_OUTGOING_CONNS_COUNT,
    count
  } as const),
}

export const initialState: State = {
  owner: null,
  ownerLoaded: false,
  acceptedConns: null,
  acceptedConnsCount: null,
  acceptedCursor: null,
  incomingConns: null,
  incomingConnsCount: null,
  incomingCursor: null,
  outgoingConns: null,
  outgoingConnsCount: null,
  outgoingCursor: null,
  commonContacts: null,
  commonContactsCount: null,
  commonContactsCursor:  null,
}

export function reducer(state: State, action: ActionsType): State {
  switch (action.type) {
    case SET_OWNER: {
      // console.log(action)
      return {
        ...state,
        owner: action.owner,
        ownerLoaded: true
      }
    }
    case CLEAN: {
      return {
        owner: null,
        ownerLoaded: false,
        acceptedConns: null,
        acceptedConnsCount: null,
        acceptedCursor: null,
        incomingConns: null,
        incomingConnsCount: null,
        incomingCursor: null,
        outgoingConns: null,
        outgoingConnsCount: null,
        outgoingCursor: null,
        commonContacts: null,
        commonContactsCount: null,
        commonContactsCursor:  null,
      }
    }
    case ACCEPT: {
      if(state.incomingConns) {
        let conn = state.incomingConns.find(incomingConn => incomingConn.id === action.id)
        if(conn) {
          conn.isAccepted = true
          return {
            ...state,
            incomingConns: [...state.incomingConns]
          }
        }
      }
      return state
    }
    case DELETE_OUTGOING: {
      if(state.outgoingConns) {
        let conn = state.outgoingConns.find(conn => conn.id === action.id)
        if(conn) {
          conn.deleted = true
          return {
            ...state,
            outgoingConns: [...state.outgoingConns]
          }
        }
      }
      return state
    }
    case DELETE_ACCEPTED: {
      if(state.acceptedConns) {
        let conn = state.acceptedConns.find(conn => conn.id === action.id)
        if(conn) {
          conn.deleted = true
          return {
            ...state,
            acceptedConns: [...state.acceptedConns]
          }
        }
      }
      return state
    }
    case DELETE_INCOMING: {
      if(state.incomingConns) {
        let conn = state.incomingConns.find(conn => conn.id === action.id)
        if(conn) {
          conn.deleted = true
          return {
            ...state,
            incomingConns: [...state.incomingConns]
          }
        }
      }
      return state
    }
    case SET_ACCEPTED_CONNS: {
      if(action.ownerUsername !== state.owner?.username) {
        return state
      }
      return {
        ...state,
        acceptedConns: action.connections,
        acceptedConnsCount: action.allCount,
        acceptedCursor: action.cursor
      }
    }
    case ADD_ACCEPTED_CONNS: {
      if(action.ownerUsername !== state.owner?.username) {
        return state
      }
      let newAcceptedConnsArr: Array<ConnectionType> = []
      if(state.acceptedConns) {
        newAcceptedConnsArr = [...state.acceptedConns]
      }
      newAcceptedConnsArr.push(...action.connections)
      return {
        ...state,
        acceptedConns: newAcceptedConnsArr,
        acceptedConnsCount: action.allCount,
        acceptedCursor: action.cursor
      }
    }
    case SET_INCOMING_CONNS: {
      return {
        ...state,
        incomingConns: action.connections,
        incomingConnsCount: action.allCount,
        incomingCursor: action.cursor,
      }
    }
    case ADD_INCOMING_CONNS: {
      return {
        ...state,
        incomingConns: state.incomingConns ? [...state.incomingConns, ...action.connections] : [],
        incomingCursor: action.cursor,
        incomingConnsCount: action.allCount
      }
    }
    case SET_OUTGOING_CONNS: {
      // console.log(action)
      return {
        ...state,
        outgoingConns: action.connections,
        outgoingConnsCount: action.allCount,
        outgoingCursor: action.cursor
      }
    }
    case ADD_OUTGOING_CONNS: {
      // console.log(state.outgoingConns, action)
      if(state.outgoingConns) {
        return {
          ...state,
          outgoingConns: state.outgoingConns.concat(action.connections),
          outgoingCursor: action.cursor,
          outgoingConnsCount: action.allCount
        }
      }
      return {...state}
    }
    case SET_COMMON_CONTACTS: {
      return {
        ...state,
        commonContacts: action.contacts,
        commonContactsCount: action.allCount,
        commonContactsCursor: action.cursor,
      }
    }
    case ADD_COMMON_CONTACTS: {
      return {
        ...state,
        commonContacts: state.commonContacts ? [...state.commonContacts, ...action.contacts] : [],
        commonContactsCount: action.allCount,
        commonContactsCursor: action.cursor,
      }
    }
    case SET_ACCEPTED_CONNS_COUNT: {
      return {
        ...state,
        acceptedConnsCount: action.count
      }
    }
    case SET_INCOMING_CONNS_COUNT: {
      return {
        ...state,
        incomingConnsCount: action.count
      }
    }
    case SET_OUTGOING_CONNS_COUNT: {
      return {
        ...state,
        outgoingConnsCount: action.count
      }
    }
    default:
      throw new Error()
  }
}

export const getOwner = (username: string) => async (dispatch: any) => {
  profileAPI.getUser(username)
    .then(
      (response) => {
        if(response.status === 200) {
          dispatch(actions.setOwner(response.data))
        }
      },
      error => {
        if(error.response) {
          if(error.response.status === 404) {
            dispatch(actions.setOwner(null))
          }
        }
      }
    )
}

type ActionsType = InferActionsTypes<typeof actions>