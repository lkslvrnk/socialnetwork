import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { ConnectionType } from '../../types/types';
import { Divider, Paper, Tab, Tabs } from '@material-ui/core';
import { useStyles } from './ConnectionsStyles';
import ConnectionSkeleton from './ConnectionSkeleton';
import IncomingConnection from './IncomingConnection';
import OutgoingConnection from './OutgoingConnection';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import EmptyListStub from '../Common/EmptyListStub';
import { useSelector } from 'react-redux';
import { AppStateType } from '../../redux/redux_store';

type PropsType = {
  incoming: Array<ConnectionType> | null
  outgoing: Array<ConnectionType> | null
  incomingCount: number | null
  outgoingCount: number | null
  incomingCursor: string | null
  outgoingCursor: string | null
  handleAccept: Function
  handleDeleteOutgoing: Function
  handleDeleteIncoming: Function
  currentUserId: string | null
  getMoreOutgoing: Function
  getMoreIncoming: Function
}

const PendingConnections: React.FC<PropsType> = React.memo((props: PropsType) => {
  const {
    incoming, 
    outgoing, 
    incomingCount, 
    outgoingCount, 
    handleAccept,
    handleDeleteOutgoing,
    handleDeleteIncoming,
    getMoreOutgoing,
    getMoreIncoming,
    incomingCursor,
    outgoingCursor
  } = props

  const classes = useStyles();
  const { t } = useTranslation()
  const location = useLocation()
  const params: any = useParams()

  let queryParams = new URLSearchParams(location.search);
  let section: string | null = queryParams.get('section')
  const tabNumber = section === 'incoming' ? 0 : 1

  const lastRequestsCheck = useSelector((state: AppStateType) => state.auth.lastRequestsCheck)

  useEffect(() => {
    document.title = t(tabNumber === 0 ? 'Incoming' : 'Outgoing')
  }, [t, tabNumber])

  const [incomingLoading, setIncomingLoading] = useState(false)
  const [outgoingLoading, setOutgoingLoading] = useState(false)

  const handleLoadMoreIncoming = async () => {
    if(!incomingLoading && !!incoming && incoming.length > 0) {
      setIncomingLoading(true)
      await getMoreIncoming()
      setIncomingLoading(false)
    }
  }

  const handleLoadMoreOutgoing = async () => {
    if(!outgoingLoading && !!outgoing && outgoing.length > 0) {
      setOutgoingLoading(true)
      await getMoreOutgoing()
      setOutgoingLoading(false)
    }
  }

  const header = (
    <Tabs value={tabNumber} aria-label="simple tabs example">
      <Tab
        label={`${t('Incoming')} ${incomingCount ? `(${incomingCount})` : '' }`}
        component={NavLink}
        to={`/i/${params.username}/contacts?section=incoming`}
      />
      <Tab
        label={`${t('Outgoing')} ${outgoingCount ? `(${outgoingCount})` : ''}`}
        component={NavLink}
        to={`/i/${params.username}/contacts?section=outgoing`}
      />
    </Tabs>
  )

  let body = null
  if((!incoming && tabNumber === 0) || (!outgoing && tabNumber === 1)) {
    body = (
      <Paper>
        {[1, 2, 3].map((item, index) => (
          <div key={index}>
            <ConnectionSkeleton />
            { index !== (2) && <Divider />}
          </div>
        ))}
      </Paper>
    )
  }
  else if(!!incoming && tabNumber === 0) {
    body = ( incoming.length > 0
      ?
      incoming.map((conn, index) => (
        <div key={conn.id}>
          <IncomingConnection
            connection={conn}
            handleAccept={handleAccept}
            handleDelete={handleDeleteIncoming}
            lastRequestsCheck={lastRequestsCheck}
          />
          { index !== (incoming.length - 1) && <Divider />}
        </div>
      ))
      :
      <Paper className={classes.emptyList} >
        <EmptyListStub
          imageSrc='/images/animals/donkey.png'
          containerWidth={150}
          containerHeight={150}
          text={t('There are no incoming requests')}
        />
      </Paper>
    )
  }
  else if(!!outgoing && tabNumber === 1) {
    body = outgoing.length > 0
      ?
      outgoing.map((conn, index) => <div key={conn.id}>
        <OutgoingConnection  
          connection={conn}
          handleDelete={handleDeleteOutgoing}
        />
        { index !== (outgoing.length - 1) && <Divider />}
      </div>)
      :
      <Paper className={classes.emptyList} >
        <EmptyListStub
          imageSrc='/images/animals/donkey.png'
          containerWidth={150}
          containerHeight={150}
          text={t('There are no outgoing requests')}
        />
      </Paper>
  }

  return (
    <main>
      <Paper>
        { header }
        <Divider />
        { body }
      </Paper>

      <div className={classes.loadMore} >
        { tabNumber === 0
          ?
          (incomingCursor &&
            <ButtonWithCircularProgress
              onClick={handleLoadMoreIncoming}
              enableProgress={incomingLoading}
              variant='contained'
              children={t('Load more')}
            />
          )
          : 
          ( outgoingCursor &&
            <ButtonWithCircularProgress
              onClick={handleLoadMoreOutgoing}
              enableProgress={outgoingLoading}
              variant='contained'
              children={t('Load more')}
            />
          )
        }
      </div>
    </main>
  )
})

export default PendingConnections