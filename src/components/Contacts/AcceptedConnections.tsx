import React, { useEffect, useState, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom'
import { ConnectionType, ContactType } from '../../types/types';
import Preloader from '../Common/Preloader/Preloader';
import { Button, Divider, Paper, Tab, Tabs, Typography } from '@material-ui/core';
import { useStyles } from './ConnectionsStyles';
import ConnectionSkeleton from './ConnectionSkeleton';
import AcceptedConnection from './AcceptedConnection';
import CommonContact from './CommonContact';

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

  const {
    connections, commonContacts, connectionsCount, commonContactsCount,
    handleDelete, isOwnProfile, handleLoadMore, cursor, loadMoreCommonContacts
  } = props

  const { t } = useTranslation()
  const [moreConnsLoading, setMoreConnsLoading] = useState(false)
  const [moreCommonContactsLoading, setMoreCommonContactsLoading] = useState(false)

  const loadMoreButton = useRef(null)
  const params: any = useParams()
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  let header = (
    <>
      <Tabs value={tabNumber} aria-label="simple tabs example">
        <Tab
          label={`${t('All contacts')} ${connectionsCount ? connectionsCount : ''}`}
          component={NavLink} to={`/i/${params.username}/contacts?section=accepted`}
        />
        { !isOwnProfile &&
        <Tab
          label={`${t('Common contacts')} ${commonContactsCount ? commonContactsCount : ''}`}
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
          <Typography variant='body2' >
            { isOwnProfile ? t("You have no contacts") : t("User has no contacts")}
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
          <Typography variant='h5' >
            { t("There is no common contacts") }
          </Typography>
        </div>
      )
    )
  }

  return (
    <div>
      <Paper component='main' >
        { header }
        { body }
      </Paper>
      
      { cursor &&
        <div className={classes.loadMore} ref={loadMoreButton} >{
          tabNumber === 0
            ? (moreConnsLoading
              ? <Preloader />
              : <Button onClick={handleLoadMoreConns} >
                  {t('Load more')}
                </Button>
            )
            : (moreCommonContactsLoading
              ? <Preloader />
              : <Button onClick={handleLoadMoreCommonContacts} >
                  {t('Load more')}
                </Button>
            )
        }
      </div>
      }
    </div>
  )
})

export default AcceptedConnections