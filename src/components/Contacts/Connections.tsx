import React, { useEffect, useReducer } from 'react';
import { NavLink, Redirect, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getCurrentUserId } from '../../redux/auth_selectors';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import { ConnectionType, ContactType, ProfileType } from '../../types/types';
import { usePrevious } from '../../hooks/hooks';
import { Avatar, ClickAwayListener, FormControl, InputLabel, List, ListItem, ListItemText, MenuItem, MenuList, Paper, Popper, Select, Typography, useMediaQuery } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import { Skeleton } from '@material-ui/lab';
import { connectionAPI } from '../../api/connection_api'
import StickyPanel from '../Common/StickyPanel';
import { useStyles } from './ConnectionsStyles';
import AcceptedConnections from './AcceptedConnections'
import PendingConnections from './PendingConnections'
import { profileAPI } from '../../api/profile_api'
import { AppStateType } from '../../redux/redux_store';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin';
import { compose } from 'redux';

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

type State = {
  owner: ProfileType | null,
  ownerUsername: string | null,
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

const initialState: State = {
  owner: null,
  ownerUsername: null,
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

function reducer(state: State, action: any) {
  switch (action.type) {
    case SET_OWNER: {
      return {
        ...state,
        owner: action.owner
      }
    }
    case CLEAN: {
      return {
        owner: null,
        ownerUsername: action.ownerUsername,
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
      if(action.ownerUsername !== state.ownerUsername) {
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
      if(action.ownerUsername !== state.ownerUsername) {
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
        incomingConns: state.incomingConns?.concat(action.connections),
        incomingCursor: action.cursor,
        incomingConnsCount: action.allCount
      }
    }
    case SET_OUTGOING_CONNS: {
      console.log(action)
      return {
        ...state,
        outgoingConns: action.connections,
        outgoingConnsCount: action.allCount,
        outgoingCursor: action.cursor
      }
    }
    case ADD_OUTGOING_CONNS: {
      console.log(state.outgoingConns, action)
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
        commonContactsCount: action.count,
        commonContactsCursor: action.cursor,
      }
    }
    case ADD_COMMON_CONTACTS: {
      return {
        ...state,
        commonContacts: state.commonContacts?.concat(action.contacts),
        commonContactsCount: action.count,
        commonContactsCursor: action.cursor,
      }
    }
    case SET_ACCEPTED_CONNS_COUNT: {
      return {
        ...state,
        acceptedConnsCount: action.allCount
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

const Connections: React.FC = React.memo((props) => {
  const classes = useStyles();
  const params: any = useParams()
  const usernameFromParams = params.username
  initialState.ownerUsername = usernameFromParams
  const [stateUR, dispatchUR] = useReducer(reducer, initialState);
  const { t } = useTranslation()
  const location = useLocation()
  const mobile = useMediaQuery('(max-width:860px)');
  let queryParams = new URLSearchParams(location.search);
  let sectionName: string | null = queryParams.get('section')
  let sectionNumber = 0
  if(!sectionName || sectionName === 'all') {
    sectionNumber = 0
  }
  else if(sectionName === 'incoming' || sectionName === 'outgoing') {
    sectionNumber = 1
  }

  const currentUserId: string | null = useSelector(getCurrentUserId)
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnProfile = currentUserUsername === usernameFromParams
  const isAuthenticated = useSelector((state: AppStateType) => state.auth.isAuth)

  const prevOwnerUsername = usePrevious(usernameFromParams)

  const getCommonContacts = async (cursor: string | null, count: number | null) => {
    let response = await connectionAPI.getUserContacts(usernameFromParams, currentUserUsername, cursor, count)
    if(response.status === 200) {
      let data = response.data
      dispatchUR({type: SET_COMMON_CONTACTS, contacts: data.items, count: data.count, cursor: data.cursor })
    }
  }

  const getMoreCommonContacts = async (cursor: string, count: number | null) => {
    let response = await connectionAPI.getUserContacts(usernameFromParams, currentUserUsername, cursor, count)
    if(response.status === 200) {
      let data = response.data
      dispatchUR({type: ADD_COMMON_CONTACTS, contacts: data.items, count: data.count, cursor: data.cursor })
    }
  }

  const getOwner = async (username: string) => {
    let response = await profileAPI.getUser(username)
    if(response.status === 200) {
      dispatchUR({type: SET_OWNER, owner: response.data })
    }
  }

  const getAccepted = async (
    actionType: 'SET-ACCEPTED-CONNS' | 'ADD-ACCEPTED-CONNS',
    ownerUsername: string,
    count: number | null,
    cursor: string | null
  ) => {
    let response = await connectionAPI.getConnectionsOfUser(ownerUsername, count, cursor, null, false, true)
    if(response.status === 200) {
      dispatchUR({type: actionType, connections: response.data.connections, allCount: response.data.allCount, cursor: response.data.cursor, ownerUsername: usernameFromParams })
    }
  }

  const getOutgoing = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, null, 'outgoing', true, false)
    if(response.status === 200) {
      let responseData = response.data
      dispatchUR({
        type: SET_OUTGOING_CONNS,
        connections: responseData.connections,
        allCount: responseData.allCount,
        cursor: responseData.cursor
      })
    }
  }

  const getMoreOutgoing = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, stateUR.outgoingCursor, 'outgoing', true, false)
    if(response.status === 200) {
      let responseData = response.data
      dispatchUR({
        type: ADD_OUTGOING_CONNS,
        connections: responseData.connections,
        allCount: responseData.allCount,
        cursor: responseData.cursor
      })
    }
  }

  const getIncoming = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, null, 'incoming', true, false)
    if(response.status === 200) {
      dispatchUR({
        type: SET_INCOMING_CONNS,
        connections: response.data.connections,
        allCount: response.data.allCount,
        cursor: response.data.cursor
      })
    }
  }

  const getMoreIncoming = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, stateUR.incomingCursor, 'incoming', true, false)
    if(response.status === 200) {
      dispatchUR({
        type: ADD_INCOMING_CONNS,
        connections: response.data.connections,
        allCount: response.data.allCount,
        cursor: response.data.cursor
      })
    }
  }

  useEffect(() => {
    (async function() {
      if(prevOwnerUsername !== undefined && prevOwnerUsername !== usernameFromParams) {
        dispatchUR({type: CLEAN, ownerUsername: usernameFromParams})
        getOwner(usernameFromParams)

        if(sectionNumber === 0) {
          getAccepted(SET_ACCEPTED_CONNS, usernameFromParams, 8, null)
          if(!isOwnProfile) {
            getCommonContacts(null, 10)
          }
        }
        else if(sectionNumber) {
          if(sectionName === 'incoming') {
            getIncoming()
          } else {
            getOutgoing()
          }
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromParams])

  useEffect(() => {
    (function() {
      if(!currentUserId) {
        return
      }
      try {
        getOwner(usernameFromParams)

        if(sectionNumber === 0 && stateUR.acceptedConnsCount === null) {
          getAccepted(SET_ACCEPTED_CONNS, usernameFromParams, 7, null)
          if(!isOwnProfile) {
            getCommonContacts(null, 10)
          }
        }
        if(sectionNumber === 1 && isOwnProfile && stateUR.outgoingConnsCount === null) {
          getOutgoing()
        }
        if(sectionNumber === 1 && isOwnProfile && stateUR.incomingConnsCount === null) {
          getIncoming()
        }
      }
      catch(err) {
        console.log(err)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionNumber])

  const deleteAccepted = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatchUR({ type: DELETE_ACCEPTED, id: connection.id })
    }
  }

  const deleteIncoming = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatchUR({ type: DELETE_INCOMING, id: connection.id })
    }
  }

  const deleteOutgoing = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatchUR({ type: DELETE_OUTGOING, id: connection.id })
    }
  }

  const acceptPending = async (connection: ConnectionType) => {
    const id = connection.id
    let response = await connectionAPI.acceptConnection(id)

    if(response.status === 200) {
      dispatchUR({ type: ACCEPT, id: id })
    }
  }

  const handleLoadMoreAccepted = async () => {
    if(stateUR.acceptedCursor) {
      await getAccepted(ADD_ACCEPTED_CONNS, usernameFromParams, 7, stateUR.acceptedCursor)
    }
  }

  const handleLoadMoreCommonContacts = async () => {
    if(stateUR.commonContactsCursor) {
      await getMoreCommonContacts(stateUR.commonContactsCursor, 10)
    }
  }
  
  let body = null
  let mobileNavSectionName = 'Contacts'

  if(sectionNumber === 0) {
    body = (
      <AcceptedConnections
        connections={ stateUR.acceptedConns }
        connectionsCount={ stateUR.acceptedConnsCount }
        commonContacts={ stateUR.commonContacts }
        commonContactsCount={ stateUR.commonContactsCount }
        commonContactsCursor={ stateUR.commonContactsCursor }
        currentUserUsername={ currentUserUsername }
        handleDelete={ deleteAccepted }
        isOwnProfile={ isOwnProfile }
        handleLoadMore={ handleLoadMoreAccepted }
        loadMoreCommonContacts={handleLoadMoreCommonContacts}
        cursor={ stateUR.acceptedCursor }
      />
    )
  }
  else if(sectionNumber === 1 && isOwnProfile) {
    mobileNavSectionName = 'Requests'
    body = (
      <PendingConnections
        outgoing={ stateUR.outgoingConns }
        incoming={ stateUR.incomingConns }
        outgoingCount={ stateUR.outgoingConnsCount }
        incomingCount={ stateUR.incomingConnsCount }
        currentUserId={ currentUserId }
        handleAccept={ acceptPending }
        handleDeleteOutgoing={ deleteOutgoing }
        handleDeleteIncoming={ deleteIncoming }
        getMoreOutgoing={getMoreOutgoing}
        getMoreIncoming={getMoreIncoming}
        incomingCursor={stateUR.incomingCursor}
        outgoingCursor={stateUR.outgoingCursor}
      />
    )
  }

  const ownerInfo = ( !isOwnProfile &&
    <div className={classes.ownerInfo} >
    { !!stateUR.owner ?
      <>
        <Avatar
          component={NavLink}
          to={`/i/${stateUR.owner.username}`}
          src={`${imagesStorage}${stateUR.owner.picture ? stateUR.owner.picture.versions.small : null}`}
          style={{ width: 48, height: 48 }}
        />
        <NavLink
          to={`/i/${stateUR.owner.username}`}
          style={{
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <Typography
            component='span'
            style={{marginLeft: 16}}
            variant='body1'
            color='textPrimary'
          >
            { `${stateUR.owner.firstName} ${stateUR.owner.lastName}` }
          </Typography>
          <Typography
            style={{marginLeft: 16}}
            variant='caption'
            color='textSecondary'
          >
            { t('To profile') }
          </Typography>
        </NavLink>
      </>
      : 
      <>
        <Skeleton variant='circle' width={48} height={48} />
        <Skeleton variant='text' width={100} height={20} style={{marginLeft: 16}} />
      </>
    }
    </div>
  )

  const mobileConnectionsNav = (
    <Paper component='nav' className={classes.topNav} >
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',}} >
        <div style={{padding: 8}}>
          <FormControl >
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              value={sectionNumber}
            >
              <MenuItem value={0} >
                <Typography
                  color='textPrimary'
                  component={NavLink}
                  to={`/i/${usernameFromParams}/contacts`}
                  children={'Contacts'}
                />
              </MenuItem>
              { isOwnProfile &&
                <MenuItem value={1} >
                  <Typography
                    color='textPrimary'
                    component={NavLink}
                    to={`/i/${usernameFromParams}/contacts?section=incoming`}
                    children={'Requests'}
                  />
                </MenuItem>
              }
            </Select>
          </FormControl>
        </div>
        {ownerInfo}
      </div>
    </Paper>
  )

  return (
    <div style={{display: 'flex'}}>

      <main style={{ flexGrow: 1,}} >
        { mobile && mobileConnectionsNav }
        { body }
      </main>

      <aside className={classes.rightPanel}>
        <StickyPanel top={55}  >
          <Paper style={{width: 300}}>
            { ownerInfo }

            <List dense component="nav" >
              <ListItem
                button
                selected={sectionNumber === 0}
                component={NavLink} to={`/i/${usernameFromParams}/contacts`}
              >
                <ListItemText primary={t(`${ isOwnProfile ? 'Contacts' : "User's contacts"}`)} />
              </ListItem>

              { isOwnProfile &&
                <ListItem
                  button
                  selected={sectionNumber === 1}
                  component={NavLink} to={`/i/${usernameFromParams}/contacts?section=incoming`}
                >
                  <ListItemText primary={t('Requests')} />
                </ListItem>
              }
            </List>
          </Paper>
        </StickyPanel>
      </aside>
    </div>
  ) 
})

export default compose(
  withRedirectToLogin
)(Connections);