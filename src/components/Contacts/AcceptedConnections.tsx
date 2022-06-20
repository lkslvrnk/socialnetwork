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
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import EmptyListStub from '../Common/EmptyListStub';

type PropsType = {
  connections: Array<ConnectionType> | null
  connectionsCount: number | null
  commonContacts: Array<ContactType> | null
  commonContactsCount: number | null
  commonContactsCursor: string | null
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
    connections, commonContacts, connectionsCount, commonContactsCount, commonContactsCursor,
    handleDelete, isOwnProfile, handleLoadMore, cursor, loadMoreCommonContacts
  } = props

  const { t } = useTranslation()
  const [moreConnsLoading, setMoreConnsLoading] = useState(false)
  const [moreCommonContactsLoading, setMoreCommonContactsLoading] = useState(false)

  const params: any = useParams()
  const location = useLocation()

  let queryParams = new URLSearchParams(location.search);
  let section: string | null = queryParams.get('section')

  let tabNumber = 0
  if(section === 'common' && !isOwnProfile) {
    tabNumber = 1
  }

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
      return <div key={index}>
        <ConnectionSkeleton />
        { index !== (2) && <Divider />}
      </div>
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
          return <div key={conn.id}>
            <AcceptedConnection
              connection={conn}
              handleDelete={handleDelete}
              isOwnProfile={isOwnProfile}
            />
            { index !== (connections.length - 1) && <Divider />}
          </div>
        })
        : 
        <Paper className={classes.emptyList} >
          <EmptyListStub
            imageSrc='/images/animals/dolphin.png'
            containerWidth={150}
            containerHeight={150}
          />
          <Typography variant='h6' >
          { isOwnProfile ? t("You have no contacts") : t("User has no contacts")}
          </Typography>
        </Paper>
      )
    )
  }
  else if(tabNumber === 1) {
    body = (
      !commonContacts
      ? <div>{ skeleton }</div>
      : ( commonContacts && commonContacts.length > 0 ?
        commonContacts.map((contact, index) => {
          return <div key={contact.id}>
            <CommonContact contact={contact} />
            { index !== (commonContacts.length - 1) && <Divider />}
          </div>
        })
        :
        <Paper className={classes.emptyList} >
          <EmptyListStub
            imageSrc='/images/animals/dolphin.png'
            containerWidth={150}
            containerHeight={150}
          />
          <Typography variant='h6' >
            { t("There is no common contacts") }
          </Typography>
        </Paper>
      )
    )
  }

  return (
    <main>
      <Paper >
        { header }
        { body }
      </Paper>
      
      <div className={classes.loadMore} >{
        tabNumber === 0
          ?
          (cursor &&
            <ButtonWithCircularProgress
              onClick={handleLoadMoreConns}
              enableProgress={moreConnsLoading}
              variant='contained'
              children={t('Load more')}
            />
          )
          : 
          ( commonContactsCursor &&
            <ButtonWithCircularProgress
              onClick={handleLoadMoreCommonContacts}
              enableProgress={moreCommonContactsLoading}
              variant='contained'
              children={t('Load more')}
            />
          )
        }
        </div>
    </main>
  )
})

export default AcceptedConnections