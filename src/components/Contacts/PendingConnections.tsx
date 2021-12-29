import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next';
import { ConnectionType } from '../../types/types';
import { Divider, Paper, Tab, Tabs } from '@material-ui/core';
import SimpleText from '../Common/SimpleText';
import { useStyles } from './ConnectionsStyles';
import ConnectionSkeleton from './ConnectionSkeleton';
import IncomingConnection from './IncomingConnection';
import OutgoingConnection from './OutgoingConnection';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';

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
  console.log(props)
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

  useEffect(() => {
    document.title = t(tabNumber === 0 ? 'Incoming' : 'Outgoing')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabNumber])

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
        label={`${t('Incoming')} ${incomingCount ? incomingCount : '' }`}
        component={NavLink}
        to={`/i/${params.username}/contacts?section=incoming`}
      />
      <Tab
        label={`${t('Outgoing')} ${outgoingCount ? outgoingCount : ''}`}
        component={NavLink}
        to={`/i/${params.username}/contacts?section=outgoing`}
      />
    </Tabs>
  )

  let body = null
  if((!incoming && tabNumber === 0) || (!outgoing && tabNumber === 1)) {
    body = (
      <Paper>
        {[1, 2, 3].map((item, index) => {
          return <>
            <ConnectionSkeleton />
            { index !== (2) && <Divider />}
          </>
        })}
      </Paper>
    )
  }
  else if(!!incoming && tabNumber === 0) {
    body = ( incoming.length > 0
      ? incoming.map((conn, index) => <>
          <IncomingConnection
            key={conn.id}
            connection={conn}
            handleAccept={handleAccept}
            handleDelete={handleDeleteIncoming}
          />
          { index !== (incoming.length - 1) && <Divider />}
        </>)
      :
      <div className={ classes.emptyList }>
        <SimpleText>{t('There are no incoming requests')}</SimpleText>
      </div>
    )
  }
  else if(!!outgoing && tabNumber === 1) {
    body = (
      outgoing.length > 0
        ? outgoing.map((conn, index) => <>
            <OutgoingConnection
              key={conn.id}
              connection={conn}
              handleDelete={handleDeleteOutgoing}
            />
            { index !== (outgoing.length - 1) && <Divider />}
          </>)
        :
        <div className={ classes.emptyList }>
          <SimpleText>{t('There are no outgoing requests')}</SimpleText>
        </div>
    )
  }

  return (
    <main>
      <Paper>
        { header }
        <Divider />
        { body }
      </Paper>

      <div className={classes.loadMore} >{
        tabNumber === 0
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