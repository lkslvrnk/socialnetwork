import React, { useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import Typography from '@material-ui/core/Typography'
import {useDispatch} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SearchStyles.js'
import { Avatar, Button, ClickAwayListener, MenuItem, MenuList, Paper, Popper } from '@material-ui/core'
import Preloader from '../Common/Preloader/Preloader.jsx';
import { ProfileType } from '../../types/types.js';
import { imagesStorage } from '../../api/api';
import { acceptConnection, createConnection, deleteConnection } from '../../redux/users_reducer';

type SearchResultItemType = {
  found: ProfileType
}

const SearchResultItem: React.FC<SearchResultItemType> = React.memo((props: SearchResultItemType) => {
  const classes = useStyles()
  const { found } = props
  const { t } = useTranslation()
  const dispatch = useDispatch()

  const userPicture = found.picture ? `${imagesStorage}/${found.picture.versions.cropped_small}` : ''
  const userFullName = `${found.firstName} ${found.lastName}`
  const userLink = `/i/${found.username}`

  const connection = found.connection

  let offerReceived = !!connection && !connection.isAccepted && connection.initiator.id === found.id
  let offerSend = !!connection && !connection.isAccepted && connection.initiator.id !== found.id
  let areConnected = !!connection && connection?.isAccepted

  const [respondMenuAnchor, setRespondMenuAnchor] = useState(null)
  const connectionButtonRef = useRef(null)

  const [connectionActionInProgress, setConnectionActionInProgress] = useState(false)

  async function handleCreateConnection(e: any) {
    if(!connection) {
      setConnectionActionInProgress(true)
      await dispatch(createConnection(found.id))
      setConnectionActionInProgress(false)
    }
  }

  async function handleRespondToConnectionRequest(e: any) {
    setRespondMenuAnchor(e.currentTarget)
  }

  async function handleDeleteConnection(e: any) {
    if(!!connection) {
      setConnectionActionInProgress(true)
      await dispatch(deleteConnection(found.id, connection.id))
      setConnectionActionInProgress(false)
      setRespondMenuAnchor(null)
    }
  }

  async function handleAcceptConnection(e: any) {
    if(!!connection) {
      setConnectionActionInProgress(true)
      await dispatch(acceptConnection(found.id, connection.id))
      setConnectionActionInProgress(false)
      setRespondMenuAnchor(null)
    }
  }

  let connectionButtonText = t('Connect')
  let onConnectionButtonClick = handleCreateConnection
  if(offerReceived) {
    onConnectionButtonClick = handleRespondToConnectionRequest
    connectionButtonText = t('Respond')
  } else if(offerSend) {
    onConnectionButtonClick = handleDeleteConnection
    connectionButtonText = t('Cancel')
  } else if(areConnected) {
    onConnectionButtonClick = handleDeleteConnection
    connectionButtonText = t('Unconnect')
  }

  let connectionButton = (
    <ClickAwayListener onClickAway={ () => setRespondMenuAnchor(null) } >
      <div>
      
      <div style={{position: 'relative'}}>
        <Button
          disabled={!!respondMenuAnchor || connectionActionInProgress}
          variant='contained'
          onClick={onConnectionButtonClick}
          ref={connectionButtonRef}
        >
          {connectionButtonText}
        </Button>
        { connectionActionInProgress && !offerReceived &&
          <div style={{position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', top: 0, bottom: 0, left: 0, right: 0}}>
            <Preloader size={20} />
          </div>
        }
      </div>

      <Popper
        open={!!respondMenuAnchor}
        anchorEl={respondMenuAnchor}
        modifiers={{
          offset: { enabled: true, offset: '0, 5' }
        }}
        transition
      >
        <Paper style={{border: '1px solid gray'}}>
          <MenuList dense>
            <MenuItem disabled={connectionActionInProgress} onClick={handleAcceptConnection} disableRipple >
              <div style={{position: 'relative'}}>
                <Typography>Accept</Typography>
                { connectionActionInProgress &&
                  <div style={{position: 'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center', top: 0, bottom: 0, left: 0, right: 0}}>
                    <Preloader size={20} />
                  </div>
                }
              </div>              
            </MenuItem>
            <MenuItem onClick={ handleDeleteConnection } disableRipple >
              Reject
            </MenuItem>
          </MenuList>
        </Paper>
      </Popper>
      </div>
    </ClickAwayListener>
  )

  return (
    <Paper className={ classes.result } >
      <Avatar
        component={ NavLink }
        to={ userLink }
        className={ classes.avatar }
        src={ userPicture }
      />

      <div style={{ flexGrow: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            component={NavLink}
            to={userLink}
            variant='body2'
            style={{ marginBottom: 8 }}
            color={ "textPrimary" }
          >
            <b>{ userFullName }</b>
          </Typography>
        </div>
      </div>

      {connectionButton}
    </Paper>
  )
})

export default SearchResultItem
