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
import ConnectionAction from '../Common/ConnectionAction';

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
  console.log(connection)

  let offerReceived = !!connection && !connection.isAccepted && connection.initiator.id === found.id
  let offerSend = !!connection && !connection.isAccepted && connection.initiator.id !== found.id
  let areConnected = !!connection && connection?.isAccepted

  const onCreateConnection = (subscribe: number) => {
    if(!!found) {
      return dispatch(createConnection(found.id, subscribe))
    }
  }

  const onDeleteConnection = () => {
    if(!!connection) {
      return dispatch(deleteConnection(found.id, connection.id))
    }
  }

  const onAcceptConnection = () => {
    if(!!connection) {
      return dispatch(acceptConnection(found.id, connection.id))
    }
  }

  const onRejectConnection = () => {
    if(!!connection) {
      return dispatch(deleteConnection(found.id, connection.id))
    }
  }

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

      <ConnectionAction
        areConnected={areConnected}
        offerReceived={offerReceived}
        offerSent={offerSend}
        onCreate={onCreateConnection}
        onAccept={onAcceptConnection}
        onReject={onRejectConnection}
        onDelete={onDeleteConnection}
      />
    </Paper>
  )
})

export default SearchResultItem
