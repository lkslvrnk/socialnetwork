import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'
import { ConnectionType, ContactType } from '../../types/types';
import Preloader from '../Common/Preloader/Preloader';
import { Avatar, Button, CircularProgress, Divider, MenuItem, MenuList, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { imagesStorage } from '../../api/api';
import { Skeleton } from '@material-ui/lab';
import { useStyles } from './ConnectionsStyles';
import ConnectionSkeleton from './ConnectionSkeleton';
import MoreHorizIcon from '@material-ui/icons/MoreHoriz';
import PopperMenu from '../Common/PopperMenu';
import DeckIcon from '@material-ui/icons/Deck';

type PropsType = {
  connections: Array<ConnectionType> | null
  connectionsCount: number | null
  commonContacts: Array<ContactType> | null
  commonContactsCount: number | null
  handleDelete: Function
  currentUserUsername: string | null
  isOwnProfile: boolean,
  handleLoadMore: Function
  loadMoreCommonContacts: Function
  cursor: string | null
}

const AcceptedConnections: React.FC<PropsType> = React.memo((props: PropsType) => {
  const classes = useStyles();

  const { connections, commonContacts, connectionsCount, commonContactsCount, currentUserUsername, handleDelete, isOwnProfile, handleLoadMore, cursor, loadMoreCommonContacts } = props
  const { t } = useTranslation()
  const [moreConnsLoading, setMoreConnsLoading] = useState(false)
  const [moreCommonContactsLoading, setMoreCommonContactsLoading] = useState(false)

  const loadMoreButton = useRef(null)
  const params: any = useParams()
  const usernameFromParams = params.username
  const location = useLocation()

  let queryParams = new URLSearchParams(location.search);
  let section: string | null = queryParams.get('section')

  let tabNumber = 0
  if(section === 'common' && !isOwnProfile) {
    tabNumber = 1
  }

  useEffect(() => {
    let observer: any = null

    if(loadMoreButton.current) {
      let options = {
        root: null,
        rootMargin: '30px',
        threshold: 0.1
      }

      // @ts-ignore
      let callback = function(entries: [], observer) {
        // @ts-ignore
        entries.forEach(entry => {
          // @ts-ignore
          if (entry.isIntersecting) {
            handleLoadMoreConns()
          }
        })
      };
      // @ts-ignore
      observer = new IntersectionObserver(callback, options);
      observer.observe(loadMoreButton.current)
    }

    return () => {
      if(observer) {
        observer.disconnect() 
      }
    }
  }, [connections, cursor])

  const handleLoadMoreConns = async () => {
    if(!moreConnsLoading && !!connections && connections.length > 0) {
      setMoreConnsLoading(true)
      await handleLoadMore()
      setMoreConnsLoading(false)
    }
  }

  const handleLoadMoreCommonContacts = async () => {
    if(!moreCommonContactsLoading && !!commonContacts) {
      setMoreCommonContactsLoading(true)
      await loadMoreCommonContacts()
      setMoreCommonContactsLoading(false)
    }
  }

  let skeleton = (
    [1, 2, 3].map((item, index) => {
      return <>
        <ConnectionSkeleton key={index} />
        { index !== (2) && <Divider />}
      </>
    })
  )

  const allContactsTabLabel = (
    <div style={{display: 'flex'}}>
      { connectionsCount !== null ?
        <>
          <Typography variant='body2' >{t('All contacts')}</Typography>&nbsp;
          <Typography variant='body2' color='textSecondary'>{connectionsCount}</Typography>
        </>
        :
        <>
          <Skeleton variant='text' width={64} height={24} />&nbsp;&nbsp;
          <Skeleton variant='text' width={24} height={24} />
        </>
      }
    </div>
  )

  const commonContactsTabLabel = ( !isOwnProfile &&
    <div style={{display: 'flex'}}>
      { commonContactsCount !== null ?
        <>
          <Typography variant='body2' >{t('Common contacts')}</Typography>&nbsp;
          <Typography variant='body2' color='textSecondary'>{commonContactsCount}</Typography>
        </>
        :
        <>
          <Skeleton variant='text' width={64} height={24} />&nbsp;&nbsp;
          <Skeleton variant='text' width={24} height={24} />
        </>
      }
    </div>
  )

  let header = (
    <>
      <Tabs value={tabNumber} aria-label="simple tabs example">
        <Tab
          label={ allContactsTabLabel }
          component={NavLink} to={`/i/${params.username}/contacts?section=accepted`}
        />
        { !isOwnProfile &&
        <Tab
          label={ commonContactsTabLabel }
          component={NavLink} to={`/i/${params.username}/contacts?section=common`}
        />
        }
      </Tabs>
      <Divider />
    </>
  )

  let body = null

  if(tabNumber === 0) {
    body = (
      !connections
      ? <div>{ skeleton }</div>
      : (
        connections && connections.length > 0
        ? connections.map((conn, index) => {
          return <>
            <AcceptedConnection
              key={conn.id}
              connection={conn}
              handleDelete={handleDelete}
              isOwnProfile={isOwnProfile}
            />
            { index !== (connections.length - 1) && <Divider />}
          </>
        })
        : <div className={ classes.emptyList }>
          <DeckIcon style={{width: 160, height: 160}} />
          <Typography variant='h5' >
            { isOwnProfile ? "У вас нет контактов" : "У пользователя пока нет контактов"}
          </Typography>
        </div>
      )
    )
  }
  else if(tabNumber === 1) {
    body = (
      !commonContacts
      ? <div>{ skeleton }</div>
      : ( commonContacts && commonContacts.length > 0 ?
        commonContacts.map((contact, index) => {
          return <>
            <CommonContact key={contact.id} contact={contact} />
            { index !== (commonContacts.length - 1) && <Divider />}
          </>
        })
        :
        <div className={ classes.emptyList }>
          <DeckIcon style={{width: 160, height: 160}} />
          <Typography variant='h5' >
            { "У вас нет общих контактов" }
          </Typography>
        </div>
      )
    )
  }

  return (
    <div>
      <Paper component='main' style={{marginBottom: 16}} >
        { header }
        { body }
      </Paper>
      
      { cursor &&
        <div style={{display: 'flex', justifyContent: 'center', marginBottom: 16}} ref={loadMoreButton} >{
          tabNumber === 0
            ? (moreConnsLoading
              ? <Preloader />
              : <Button onClick={handleLoadMoreConns} >{t('Load more')}</Button>
            )
            : (moreCommonContactsLoading
              ? <Preloader />
              : <Button onClick={handleLoadMoreCommonContacts} >{t('Load more')}</Button>
            )
        }
      </div>
      }
    </div>
  )
})

type CommonContactPropsType = {
  contact: ContactType
}

const CommonContact: React.FC<CommonContactPropsType> = React.memo((props: CommonContactPropsType) => {
  const classes = useStyles()
  const contact = props.contact

  const contactPicture = `${imagesStorage}${contact.picture}`
  const contactName = `${contact.firstname} ${contact.lastname}`
  const contactLink = `/i/${contact.username}`

  return (
    <div>
      <div className={ classes.connection } key={contact.id} >
        <Avatar
          component={NavLink}
          to={contactLink}
          className={classes.avatar}
          src={contactPicture}
        />

        <div style={{flexGrow: 1}}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography color='textPrimary' component={NavLink} to={contactLink} variant='body2' style={{marginBottom: 8}} >
              <b>{ contactName }</b>
            </Typography>
          </div>
        </div>
      </div>
      
    </div>
  )
})

type AcceptedConnectionPropsType = {
  connection: ConnectionType
  handleDelete: Function
  isOwnProfile: boolean
}

const AcceptedConnection: React.FC<AcceptedConnectionPropsType> = React.memo((props: AcceptedConnectionPropsType) => {
  const classes = useStyles()

  const params: any = useParams()

  const {connection, handleDelete, isOwnProfile} = props

  const initiator = connection.initiator
  const target = connection.target
  const { t } = useTranslation()

  const isInitiator = connection.initiator.username === params.username

  const userPicture = isInitiator
    ? `${imagesStorage}/${target.picture}`
    : `${imagesStorage}/${initiator.picture}`
    
  const userFullName = isInitiator
    ? `${target.firstName} ${target.lastName}`
    : `${initiator.firstName} ${initiator.lastName}`

  const username = isInitiator ? target.username : initiator.username
  const userLink = `/i/${username}`

  const menuButton = useRef(null)
  const [menuAnchor, setMenuAnchor] = useState(null)

  const openMenu = (event: any) => {
    if(Boolean(menuAnchor)) {
      return
    }
    setMenuAnchor(event.currentTarget)
  }

  const onClickAway = (event: any) => {
    if(event.target === menuButton.current) {
      event.stopPropagation()
      return
    }
    setMenuAnchor(null)
  }

  const [isDeleting, setIsDeleting] = useState<boolean>(false)

  const onDelete = async () => {
    setIsDeleting(true)
    await handleDelete(connection)
    setIsDeleting(false)
  }

  const contactDeleted = connection.deleted

  return (
    <div className={ classes.connection } key={ connection.id } >
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
            color={ contactDeleted ? "textSecondary" : "textPrimary" }
          >
            <b>{ userFullName }</b>
          </Typography>
          
          { isOwnProfile && !contactDeleted &&
            <>
            <div style={{ cursor: 'pointer' }} onClick={ openMenu } >
              <MoreHorizIcon ref={ menuButton } />
            </div>

            <PopperMenu anchor={ menuAnchor } onClickAway={ onClickAway } >
              <MenuList dense>
                <MenuItem disableRipple disabled={ isDeleting } onClick={ onDelete } >
                  <div style={{ position: 'relative' }} >
                    <div>Delete from contacts</div>
                  </div>
                  { isDeleting && 
                    <div style={{ position: 'absolute', width: 32, top: '0', left: 0, right: 0, margin: '0 auto' }} >
                      <CircularProgress color='secondary' size={ 32 } />
                    </div>
                  }
                  
                </MenuItem>
              </MenuList>
            </PopperMenu>
            </>
          }
        </div>

        { contactDeleted &&
          <Typography variant='body2' color='textSecondary' >{ t('Contact deleted') }</Typography>
        }
      </div>
    </div>
  )
})

export default AcceptedConnections