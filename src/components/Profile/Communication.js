import React, { useState } from 'react';
import { actions, createSubscription, deleteSubscription, getConnection, getSubscription } from '../../redux/profile_reducer'
import { createConnection, deleteConnection, acceptConnection } from '../../redux/profile_reducer';
import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, IconButton, TextField, useMediaQuery} from '@material-ui/core';
import Preloader from '../Common/Preloader/Preloader.jsx';
import MessageIcon from '@material-ui/icons/Message';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';
import Skeleton from '@material-ui/lab/Skeleton';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from '../../redux/profile_selectors';
import { NavLink, useParams } from 'react-router-dom';
import { useStyles } from './ProfileStyles';
import { useTranslation } from 'react-i18next';
import EditIcon from '@material-ui/icons/Edit';
import ConnectionAction from '../Common/ConnectionAction';
import AcceptDialog from '../Common/AcceptDialog';
import TypographyLink from '../Common/TypographyLink';
import ZoomOutMapIcon from '@material-ui/icons/ZoomOutMap';
import { chatsAPI } from '../../api/chats_api';
import { useSnackbar } from 'notistack';
import { ulid } from 'ulid';
import removeEmptyLines from "remove-blank-lines"
import { createUlidId, createUser } from '../Chats/helperChatFunctions';
import { connectionAPI } from '../../api/connection_api';
import { ConnectionType } from '../../types/types';
import { getCurrentUserData, getCurrentUserData2 } from '../../redux/auth_selectors';
import { subscriptionAPI } from '../../api/subscription_api';

const Communication = React.memo(props => {

  const {currentUserId, profile, profileLoaded} = props
  const small = useMediaQuery('(max-width: 600px)')
  const mobile = useMediaQuery('(max-width: 860px)')
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

  const [connectionActionInProgress, setConnectionActionInProgress] = useState(false)
  const [subscriptionActionInProgress, setSubscriptionActionInProgress] = useState(false)

  let buttonsSectionClass = mobile
    ? classes.buttonsSectionMobile : classes.buttonsSection

  if(!profileLoaded) {
    return (
      <div className={buttonsSectionClass}>
        { [150, 120, 170].map(width => {
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

  const onSubscription = async () => {
    if(!profile) return
    try {
      setSubscriptionActionInProgress(true)
      const profileId = profile.id
      let response = await subscriptionAPI.createSubscription(profile.id)
      if(response.status === 201 && currentUserData) {
        const subscriber = createUser(
          currentUserData.id, currentUserData.firstName,
          currentUserData.lastName, currentUserData.picture,
        )
        const user = createUser(
          profile.id, profile.firstName, profile.lastName,
          profile.picture ? profile.picture.versions.cropped_small : null
        )
        const id = response.data.id
        const subscription = {
          id, subscriber, user,
          pauseDurationInDays: null,
          pauseEnd: null,
          pauseStart: null
        }
        dispatch(actions.setSubscription(subscription))
      }
    } catch(error) {
      if(error.response && error.response.status === 422) {
        let responseData = error.response.data
        if(responseData.code === 33 && responseData.subscription_id) {
          await dispatch(getSubscription(responseData.subscription_id))
        }
      }
    } finally {
      setSubscriptionActionInProgress(false)
    }
  }

  const subscribeOnUser = async (profileId) => {
    await dispatch(createSubscription(profileId))
    setSubscriptionActionInProgress(false)
  }
  const unsubscribeUser = async (subscriptionId) => {
    await dispatch(deleteSubscription(subscriptionId))
    setSubscriptionActionInProgress(false)
  }

  const onCreateConnection = async (subscribe) => {
    if(!profile) return 0
    if(subscribe) {
      setSubscriptionActionInProgress(true)
    }
    try {
      let response = await connectionAPI.createConnection(profile.id, 0)
      if(response.status === 201 && currentUserData) {
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
      if(error.response && error.response.status === 422) {
        let responseData = error.response.data
        if([22, 23, 24].includes(responseData.code) && responseData.connection_id) {
          await dispatch(getConnection(responseData.connection_id))
        }
      } 
    } finally {

    }
    if(subscribe && profile && !profile.subscription) {
      subscribeOnUser(profile.id)
    }
  }

  const onDeleteConnection = async (unsubscribe) => {
    if(unsubscribe && !!profile.subscription) {
      setSubscriptionActionInProgress(true)
    }
    if(!!connection) {
      await dispatch(deleteConnection(connection.id))
    }
    if(unsubscribe && !!profile.subscription) {
      unsubscribeUser(profile.subscription.id)
    }
  }

  const onAcceptConnection = async (subscribe) => {
    if(subscribe && !!profile) {
      setSubscriptionActionInProgress(true)
    }
    if(!!connection) {
      await dispatch(acceptConnection(connection.id))
    }
    if(subscribe && !!profile) { 
      subscribeOnUser(profile.id)
    }
  }

  const onRejectConnection = async (unsubscribe) => {
    if(unsubscribe && !!profile.subscription) {
      setSubscriptionActionInProgress(true)
    }
    if(!!connection) {
      await dispatch(deleteConnection(connection.id))
    }
    if(unsubscribe && !!profile.subscription) {
      unsubscribeUser(profile.subscription.id)
    }
  }

  const subscription = profile.subscription

  const subscriptionRequest = async () => {
    if(!subscription) {
      // setSubscriptionActionInProgress(true)
      await dispatch(createSubscription(profile.id))
      // setSubscriptionActionInProgress(false)
    }
    else {
      // setSubscriptionActionInProgress(true)
      await dispatch(deleteSubscription(subscription.id))
      // setSubscriptionActionInProgress(false)
    }
  }
  const onSubscriptionButtonClick = () => {
    setSubscriptionActionInProgress(true)
    subscriptionRequest()
      .then(() => setSubscriptionActionInProgress(false), () => setSubscriptionActionInProgress(false))
  }

  let subscribeButtonTitle = subscription ? t('Unsubscribe') : t('Subscribe')

  let openCancelDialog = () => {
    if(text) {
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
    // setText(value.replace(new RegExp('\r?\n','g', '↵'), ''))
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

  const onSend = async () => {
    let textCopy = text
    let trimmedAndWithoutEmptyLinesText = removeEmptyLines(textCopy.trim())

    try {
      setMessageIsSending(true)
      let getResponse = await chatsAPI.getChatsOfUser(currentUserId, 'pair_user_chat', profile.id, 1, null, 0)

      const messageClientId = createUlidId()
      if(getResponse.data.items.length > 0) {
        let chatId = getResponse.data.items[0].id
        try {
          chatsAPI.createMessage(chatId, trimmedAndWithoutEmptyLinesText, messageClientId, windowId)
          onSuccessMessage()
        } catch(e) {
          onSendMessageFail()
        }
      } else {
        try {
          const chatClientId = createUlidId()
          await chatsAPI.createPairChat(profile.id, trimmedAndWithoutEmptyLinesText, chatClientId, messageClientId, windowId)
          onSuccessMessage()
        } catch(e) {
          onSendMessageFail()
        }
      }
    } catch(e) {}
  }

  const trimmedText = text.trim()
  const sendMessageButtonIsDisabled = !trimmedText || messageIsSending

  return (
    <div className={buttonsSectionClass} >
      <Button
        disableElevation
        color='primary'
        variant="contained"
        startIcon={<MessageIcon />}
        onClick={() => setShowNewMessage(true)}
      >
        {t('Message')}
      </Button>

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
        classes={{paper: classes.paper}}
        // fullScreen={small}        
      >
        <DialogTitle >
          <div style={{display: 'flex', justifyContent: 'space-between'}}>
            <div style={{}} >{t('New message')}</div>
            <IconButton
              disableRipple
              aria-label="close"
              style={{
                position: 'absolute',
                right: 8,
                top: 8
              }}
              component={NavLink}
              to={`/chats/c/${profile.id}`}
            >
              <ZoomOutMapIcon />
            </IconButton>
          </div>
        </DialogTitle>
          
        <DialogContent >
          <TextField
            size='small'
            multiline
            fullWidth
            value={ text }
            onChange={ onTextChange }
            onFocus={ e => {
              e.currentTarget.setSelectionRange(
                text.length,
                text.length
              )}
            }
          />
        </DialogContent>

        <DialogActions>
          <Button 
            disableElevation
            onClick={() => setShowNewMessage(false)}
          >
            {t('Close')}
          </Button>

          <ButtonWithCircularProgress
            disableElevation
            variant="contained" 
            onClick={onSend}
            children={t('Send')}
            enableProgress={false}
            disabled={sendMessageButtonIsDisabled}
          />

        </DialogActions>
        <AcceptDialog
          show={showCancelDialog}
          setShow={setShowCancelDialog}
          onYes={() => {
            setShowNewMessage(false)
            setText('')
            closeCancelDialog()
          }}
          title={t('Discard changes')}
          text={t('You sure you want to discard changes?')}
        />
      </Dialog>

    </div>
  )
  
})

export default Communication