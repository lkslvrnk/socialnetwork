import { ThunkAction } from "redux-thunk"
import { AppStateType, InferActionsTypes } from "./redux_store"
import { ConnectionType } from "../types/types"

const SET_CONNECTIONS = 'connections/SET-CONNECTIONS'
const ADD_ACCEPTED_CONNECTIONS = 'connections/ADD-ACCEPTED-CONNECTIONS'
const SET_ACCEPTED_CONNECTIONS_COUNT = 'connections/SET-ACCEPTED-CONNECTIONS-COUNT'

let initialState = {
  connections: null as Array<ConnectionType> | null,
  allConnectionsCount: null as number | null,
  acceptedConnections: undefined as Array<ConnectionType> | undefined,
  acceptedConnectionsCount: undefined as number | undefined,
  acceptedConnectionsCursor: undefined as string | null | undefined,
  outgoingConnections: undefined as Array<ConnectionType> | undefined,
  outgoingConnectionsCount: undefined as number | undefined,
  incomingConnections: undefined as Array<ConnectionType> | undefined,
  incomingConnectionsCount: undefined as number | undefined,
}

const appReducer = (
  state: InitialStateType = initialState, action: any
): InitialStateType => {
  switch (action.type) {
    case SET_CONNECTIONS:
      return {
        ...state,
        connections: action.connections,
        allConnectionsCount: action.count
      }
    default:
      return state;
  }
}

const actions = {
  setConnections: (connections: Array<ConnectionType>, count: number) => (
    { type: SET_CONNECTIONS, connections, count} as const
  ),
  addAcceptedConnections: (connections: Array<ConnectionType>) => (
    { type: ADD_ACCEPTED_CONNECTIONS, connections} as const
  ),
  setAcceptedConnectionsCount: (count: number) => ({
    type: SET_ACCEPTED_CONNECTIONS_COUNT, count
  } as const)
}

type InitialStateType = typeof initialState
type ActionsType = InferActionsTypes<typeof actions>
type ThunkType = ThunkAction<void, AppStateType, unknown, ActionsType>

export default appReducer;
