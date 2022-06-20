import React, { useCallback, useEffect, useReducer } from 'react';
import { NavLink, Redirect, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getCurrentUserId } from '../../redux/auth_selectors';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import { ConnectionType, ContactType, ProfileType } from '../../types/types';
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
import ProfileNotFound from '../Common/ProfileNotFound';
import {initialState, actions, reducer, SET_ACCEPTED_CONNS, ADD_OUTGOING_CONNS, SET_INCOMING_CONNS, ADD_INCOMING_CONNS, DELETE_ACCEPTED, DELETE_INCOMING, DELETE_OUTGOING, ACCEPT, ADD_ACCEPTED_CONNS} from './reducer'
import { usePrevious } from '../../hooks/hooks_ts';


const Connections: React.FC = React.memo((props) => {
  const classes = useStyles();
  const params: any = useParams()
  const usernameFromParams = params.username

  const [state, dispatch] = useReducer(reducer, initialState);
  const { t } = useTranslation()
  const location = useLocation()
  const mobile = useMediaQuery('(max-width:860px)');
  let queryParams = new URLSearchParams(location.search);
  let sectionName: string | null = queryParams.get('section')
  let sectionNumber = 0
  if(!sectionName || sectionName === 'all') {
    sectionNumber = 0
  }
  else if(sectionName === 'incoming') {
    sectionNumber = 1
  }
  else if(sectionName === 'outgoing') {
    sectionNumber = 2
  }

  const currentUserId: string | null = useSelector(getCurrentUserId)
  const currentUserUsername: string | null = useSelector(getCurrentUserUsername)
  const isOwnProfile = currentUserUsername === usernameFromParams
  const newRequestsCount = useSelector((state: AppStateType) => state.auth.newRequestsCount)
  const prevOwnerUsername = usePrevious(usernameFromParams)

  useEffect(() => {
    (async function() {
      if(prevOwnerUsername !== usernameFromParams) {
        dispatch(actions.clean())
      }
      getOwner(usernameFromParams)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromParams])

  const getOwner = useCallback(async (username: string) => {
    try {
      const response = await profileAPI.getUser(username)
      dispatch(actions.setOwner(response.data))
    } catch (e) {
      dispatch(actions.setOwner(null))
    }
  }, [])

  const prevOwner = usePrevious<ProfileType | null>(state.owner)

  useEffect(() => { // Полноценно выполняется после загрузки владельца
    (async function() {
      // console.log(state.owner)
      if(state.owner) {
        if(sectionNumber === 0) {
          getAccepted(SET_ACCEPTED_CONNS, state.owner.username, 8, null)
          if(!isOwnProfile) {
            getCommonContacts(null, 10)
          }
        }
        else if(sectionNumber === 1) {
          getIncoming()
        } else if(sectionNumber === 2) {
          getOutgoing()
        }
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.owner])

  const prevSectionNumber = usePrevious<number>(sectionNumber)

  useEffect(() => {
    if(!currentUserId || !state.owner) {
      return
    }
    try {
      if(sectionNumber === 0 && state.acceptedConnsCount === null) {
        getAccepted(SET_ACCEPTED_CONNS, usernameFromParams, 7, null)
        if(!isOwnProfile) {
          getCommonContacts(null, 10)
        }
      }
      if(sectionNumber === 2 && isOwnProfile && state.outgoingConnsCount === null) {
        getOutgoing()
      }
      if(sectionNumber === 1 && isOwnProfile && state.incomingConnsCount === null) {
        getIncoming()
      }
    }
    catch(err) {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sectionNumber])

  if(state.ownerLoaded && !state.owner) {
    return <ProfileNotFound />
  }

  const getCommonContacts = async (cursor: string | null, count: number | null) => {
    let response = await connectionAPI.getUserContacts(usernameFromParams, currentUserUsername, cursor, count)
    if(response.status === 200) {
      let data = response.data
      dispatch(actions.setCommonContacts(data.items, data.count, data.cursor))
    }
  }

  const getMoreCommonContacts = async (cursor: string, count: number | null) => {
    let response = await connectionAPI.getUserContacts(usernameFromParams, currentUserUsername, cursor, count)
    if(response.status === 200) {
      let data = response.data
      dispatch(actions.addCommonContacts(data.items, data.count, data.cursor))
    }
  }

  const getAccepted = async (
    actionType: 'SET-ACCEPTED-CONNS' | 'ADD-ACCEPTED-CONNS',
    ownerUsername: string,
    count: number | null,
    cursor: string | null
  ) => {
    let response = await connectionAPI.getConnectionsOfUser(ownerUsername, count, cursor, null, false, true, null)
    if(response.status === 200) {
      dispatch({type: actionType, connections: response.data.connections, allCount: response.data.allCount, cursor: response.data.cursor, ownerUsername: usernameFromParams })
    }
  }

  const getOutgoing = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, null, 'outgoing', true, false, null)
    if(response.status === 200) {
      let responseData = response.data
      dispatch(actions.setOutgoingConnections(responseData.connections, responseData.allCount, responseData.cursor))
    }
  }

  const getMoreOutgoing = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, state.outgoingCursor, 'outgoing', true, false, null)
    if(response.status === 200) {
      let responseData = response.data
      dispatch({
        type: ADD_OUTGOING_CONNS,
        connections: responseData.connections,
        allCount: responseData.allCount,
        cursor: responseData.cursor
      })
    }
  }

  const getIncoming = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, null, 'incoming', true, false, null)
    if(response.status === 200) {
      dispatch({
        type: SET_INCOMING_CONNS,
        connections: response.data.connections,
        allCount: response.data.allCount,
        cursor: response.data.cursor
      })
    }
  }

  const getMoreIncoming = async () => {
    let response = await connectionAPI.getConnectionsOfUser(usernameFromParams, 10, state.incomingCursor, 'incoming', true, false, null)
    if(response.status === 200) {
      dispatch({
        type: ADD_INCOMING_CONNS,
        connections: response.data.connections,
        allCount: response.data.allCount,
        cursor: response.data.cursor
      })
    }
  }


  const deleteAccepted = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatch({ type: DELETE_ACCEPTED, id: connection.id })
    }
  }

  const deleteIncoming = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatch({ type: DELETE_INCOMING, id: connection.id })
    }
  }

  const deleteOutgoing = async (connection: ConnectionType, type: string) => {
    let response = await connectionAPI.deleteConnection(connection.id)
    if(response.status === 200) {
      dispatch({ type: DELETE_OUTGOING, id: connection.id })
    }
  }

  const acceptPending = async (connection: ConnectionType) => {
    const id = connection.id
    let response = await connectionAPI.acceptConnection(id)

    if(response.status === 200) {
      dispatch({ type: ACCEPT, id: id })
    }
  }

  const handleLoadMoreAccepted = async () => {
    if(state.acceptedCursor) {
      await getAccepted(ADD_ACCEPTED_CONNS, usernameFromParams, 7, state.acceptedCursor)
    }
  }

  const handleLoadMoreCommonContacts = async () => {
    if(state.commonContactsCursor) {
      await getMoreCommonContacts(state.commonContactsCursor, 10)
    }
  }
  
  let body = null
  let mobileNavSectionName = 'Contacts'

  if(sectionNumber === 0) {
    body = (
      <AcceptedConnections
        connections={ state.acceptedConns }
        connectionsCount={ state.acceptedConnsCount }
        commonContacts={ state.commonContacts }
        commonContactsCount={ state.commonContactsCount }
        commonContactsCursor={ state.commonContactsCursor }
        currentUserUsername={ currentUserUsername }
        handleDelete={ deleteAccepted }
        isOwnProfile={ isOwnProfile }
        handleLoadMore={ handleLoadMoreAccepted }
        loadMoreCommonContacts={handleLoadMoreCommonContacts}
        cursor={ state.acceptedCursor }
      />
    )
  }
  else if(sectionNumber === 1 || sectionNumber === 2 && isOwnProfile) {
    mobileNavSectionName = 'Requests'
    body = (
      <PendingConnections
        outgoing={ state.outgoingConns }
        incoming={ state.incomingConns }
        outgoingCount={ state.outgoingConnsCount }
        incomingCount={ state.incomingConnsCount }
        currentUserId={ currentUserId }
        handleAccept={ acceptPending }
        handleDeleteOutgoing={ deleteOutgoing }
        handleDeleteIncoming={ deleteIncoming }
        getMoreOutgoing={getMoreOutgoing}
        getMoreIncoming={getMoreIncoming}
        incomingCursor={state.incomingCursor}
        outgoingCursor={state.outgoingCursor}
      />
    )
  }

  const ownerInfo = ( !isOwnProfile &&
    <div className={classes.ownerInfo} >
    { !!state.owner ?
      <>
        <Avatar
          component={NavLink}
          to={`/i/${state.owner.username}`}
          src={`${state.owner.picture ? state.owner.picture.versions.small : null}`}
          style={{ width: 48, height: 48 }}
        />
        <NavLink
          to={`/i/${state.owner.username}`}
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
            { `${state.owner.firstName} ${state.owner.lastName}` }
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
              value={sectionNumber === 0 ? 0 : 1}
              MenuProps={{ disableScrollLock: true }}
            >
              <MenuItem value={0} style={{padding: 0}}>
                <Typography
                style={{padding: 8, width: '100%'}}
                  color='textPrimary'
                  component={NavLink}
                  to={`/i/${usernameFromParams}/contacts`}
                  children={'Contacts'}
                />
              </MenuItem>
              { isOwnProfile &&
                <MenuItem value={1} style={{padding: 0}} >
                  <Typography
                    style={{padding: 8, width: '100%'}}
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
                  { newRequestsCount > 0 &&
                    <div className={classes.newRequestsCount} >
                      {newRequestsCount}
                    </div>
                  }
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