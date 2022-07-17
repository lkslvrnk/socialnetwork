import React, { useState } from 'react';
import {
  actions, createSubscription, deleteSubscription, getConnection
} from '../../../redux/profile_reducer'
import {
  deleteConnection, acceptConnection
} from '../../../redux/profile_reducer';
import {
  Button, Dialog, DialogActions, DialogContent,
  DialogTitle, IconButton, TextField
} from '@material-ui/core';
import MessageIcon from '@material-ui/icons/Message';
import Skeleton from '@material-ui/lab/Skeleton';
import ButtonWithCircularProgress from '../../Common/ButtonWithCircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { useStyles } from './CommunicationStyles.js';
import { useTranslation } from 'react-i18next';
import ConnectionAction from '../../Common/ConnectionAction';
import AcceptDialog from '../../Common/AcceptDialog';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { chatsAPI } from '../../../api/chats_api';
import { useSnackbar } from 'notistack';
import removeEmptyLines from "remove-blank-lines"
import { createUlidId, createUser } from '../../../helper/helperChatFunctions';
import { connectionAPI } from '../../../api/connection_api';
import { getCurrentUserData2 } from '../../../redux/auth_selectors';

const Communication = React.memo(props => {

  const { currentUserId, profile, profileLoaded } = props
  const classes = useStyles({ 'matches800': true })
  let [showNewMessage, setShowNewMessage] = useState(false)
  let [showCancelDialog, setShowCancelDialog] = useState(false)
  let [text, setText] = useState('')
  const { enqueueSnackbar } = useSnackbar();
  const [messageIsSending, setMessageIsSending] = useState(false)
  const windowId = useSelector((state) => state.app.windowId)
  const currentUserData = useSelector(getCurrentUserData2)
  const dispatch = useDispatch()
  const { t } = useTranslation()

  const [subscriptionActionInProgress, setSubscriptionActionInProgress] = useState(false)

  if (!profileLoaded) {
    return (
      <div className={classes.buttonsSection}>
        {[150, 120, 170].map(width => {
          return (
            <div key={width}>
              <Skeleton
                className={classes.buttonSkeleton}
                variant='rect'
                width={'100%'}
                height={36}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const connection = profile.connection
  const areConnected = connection && connection.isAccepted
  const currentUserInitiatorOfConnection = connection && connection.initiator.id === currentUserId
  const ownerOfProfileInitiatorOfConnection = connection && connection.initiator.id === profile.id

  const subscribeOnUser = async (profileId) => {
    await dispatch(createSubscription(profileId))
    setSubscriptionActionInProgress(false)
  }
  const unsubscribeUser = async (subscriptionId) => {
    await dispatch(deleteSubscription(subscriptionId))
    setSubscriptionActionInProgress(false)
  }

  const onCreateConnection = async (subscribe) => {
    if (!profile) return 0
    if (subscribe) {
      setSubscriptionActionInProgress(true)
    }
    try {
      let response = await connectionAPI.createConnection(profile.id, 0)
      if (response.status === 201 && currentUserData) {
        const initiator = createUser(
          currentUserData.id, currentUserData.firstName,
          currentUserData.lastName, currentUserData.picture,
        )
        const target = createUser(
          profile.id, profile.firstName, profile.lastName,
          profile.picture ? profile.picture.versions.cropped_small : null
        )
        const connection = {
          id: response.data.id,
          isAccepted: false,
          createdAt: Date.now(),
          deleted: false,
          initiator, target,
        }
        dispatch(actions.setConnection(connection))
      }
    }
    catch (error) {
      if (error.response && error.response.status === 422) {
        let responseData = error.response.data
        if ([22, 23, 24].includes(responseData.code) && responseData.connection_id) {
          await dispatch(getConnection(responseData.connection_id))
        }
      }
    } finally {

    }
    if (subscribe && profile && !profile.subscription) {
      subscribeOnUser(profile.id)
    }
  }

  const onDeleteConnection = async (unsubscribe) => {
    if (unsubscribe && !!profile.subscription) {
      setSubscriptionActionInProgress(true)
    }
    if (!!connection) {
      await dispatch(deleteConnection(connection.id))
    }
    if (unsubscribe && !!profile.subscription) {
      unsubscribeUser(profile.subscription.id)
    }
  }

  const onAcceptConnection = async (subscribe) => {
    if (subscribe && !!profile) {
      setSubscriptionActionInProgress(true)
    }
    if (!!connection) {
      await dispatch(acceptConnection(connection.id))
    }
    if (subscribe && !!profile) {
      subscribeOnUser(profile.id)
    }
  }

  const onRejectConnection = async (unsubscribe) => {
    if (unsubscribe && !!profile.subscription) {
      setSubscriptionActionInProgress(true)
    }
    if (!!connection) {
      await dispatch(deleteConnection(connection.id))
    }
    if (unsubscribe && !!profile.subscription) {
      unsubscribeUser(profile.subscription.id)
    }
  }

  const subscription = profile.subscription

  const subscriptionRequest = async () => {
    if (!subscription) {
      await dispatch(createSubscription(profile.id))
    } else {
      await dispatch(deleteSubscription(subscription.id))
    }
  }
  const onSubscriptionButtonClick = () => {
    setSubscriptionActionInProgress(true)
    subscriptionRequest()
      .then(() => setSubscriptionActionInProgress(false), () => setSubscriptionActionInProgress(false))
  }

  let subscribeButtonTitle = subscription ? t('Unsubscribe') : t('Subscribe')

  let openCancelDialog = () => {
    if (text) {
      setShowCancelDialog(true)
    } else {
      setShowNewMessage(false)
    }
  }

  let closeCancelDialog = () => {
    setShowCancelDialog(false)
  }

  const onTextChange = e => {
    let value = e.target.value
    setText(value)
  }

  const onSuccessMessage = () => {
    setMessageIsSending(false)
    setShowNewMessage(false)
    setText('')
    enqueueSnackbar("Сообщение было отправлено")
  }

  const onSendMessageFail = () => {
    setMessageIsSending(false)
  }

  const onSendMessage = async () => {
    let textCopy = text
    let trimmedAndWithoutEmptyLinesText = removeEmptyLines(textCopy.trim())

    try {
      setMessageIsSending(true)
      let getResponse = await chatsAPI.getChatsOfUser(currentUserId, 'pair_user_chat', profile.id, 1, null, 0)

      const messageClientId = createUlidId()
      if (getResponse.data.items.length > 0) {
        let chatId = getResponse.data.items[0].id
        try {
          console.log(windowId)
          chatsAPI.createMessage(chatId, trimmedAndWithoutEmptyLinesText, messageClientId, undefined, windowId)
          onSuccessMessage()
        } catch (e) {
          onSendMessageFail()
        }
      } else {
        try {
          const chatClientId = createUlidId()
          await chatsAPI.createPairChat(profile.id, trimmedAndWithoutEmptyLinesText, chatClientId, messageClientId, windowId)
          onSuccessMessage()
        } catch (e) {
          onSendMessageFail()
        }
      }
    } catch (e) { }
  }

  const onCloseNewMessageWindow = () => {
    setShowNewMessage(false)
    setText('')
    closeCancelDialog()
  }

  const onNewMessageFieldFocus = e => {
    e.currentTarget.setSelectionRange(
      text.length, text.length
    )
  }

  const trimmedText = text.trim()
  const sendMessageButtonIsDisabled = !trimmedText || messageIsSending

  return (
    <div className={classes.buttonsSection} >
      <Button
        disableElevation
        color='primary'
        variant="contained"
        startIcon={<MessageIcon />}
        onClick={() => setShowNewMessage(true)}
        children={t('Message')}
      />

      <ButtonWithCircularProgress
        disableElevation
        color='secondary' variant='contained'
        children={subscribeButtonTitle}
        onClick={onSubscriptionButtonClick}
        enableProgress={subscriptionActionInProgress}
        disabled={subscriptionActionInProgress}
      />

      <ConnectionAction
        areConnected={areConnected}
        offerReceived={!areConnected && ownerOfProfileInitiatorOfConnection}
        offerSent={!areConnected && currentUserInitiatorOfConnection}
        onCreate={onCreateConnection}
        onAccept={onAcceptConnection}
        onReject={onRejectConnection}
        onDelete={onDeleteConnection}
        isSubscribed={!!profile.subscription}
      />

      <Dialog
        onClose={openCancelDialog}
        open={showNewMessage}
        classes={{ paper: classes.paper }}
      >
        <DialogTitle >
          <div className={classes.newMessageDialogTitle}>
            <div>{t('New message')}</div>
            <IconButton
              disableRipple
              aria-label="close"
              className={classes.toMessengerButton}
              component={NavLink}
              to={`/chats/c/${profile.id}`}
              children={<ZoomOutMapIcon />}
            />
          </div>
        </DialogTitle>

        <DialogContent >
          <TextField
            size='small'
            multiline
            fullWidth
            value={text}
            onChange={onTextChange}
            onFocus={onNewMessageFieldFocus}
          />
        </DialogContent>

        <DialogActions>
          <Button
            disableElevation
            onClick={() => setShowNewMessage(false)}
            children={t('Close')}
          />

          <ButtonWithCircularProgress
            disableElevation
            variant="contained"
            onClick={onSendMessage}
            children={t('Send')}
            enableProgress={false}
            disabled={sendMessageButtonIsDisabled}
          />
        </DialogActions>

        <AcceptDialog
          show={showCancelDialog}
          setShow={setShowCancelDialog}
          onYes={onCloseNewMessageWindow}
          title={t('Discard changes')}
          text={t('You sure you want to discard changes?')}
        />
      </Dialog>
    </div>
  )
})

export default Communication