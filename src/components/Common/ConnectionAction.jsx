import React, { useState } from 'react'
import { Button, Checkbox, ClickAwayListener, Dialog, DialogActions, DialogContent, FormControlLabel, MenuItem } from '@material-ui/core';
import ButtonWithCircularProgress from './ButtonWithCircularProgress';
// import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { useTranslation } from 'react-i18next';
import PopperMenu from './PopperMenu';

const ConnectionAction = props => {
  const {
    areConnected,
    offerReceived,
    offerSent,
    onCreate,
    onAccept,
    onReject,
    onDelete,
    isSubscribed
  } = props

  const { t } = useTranslation()

  const [inProgress, setInProgress] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [subscribingChecked, setSubscribingChecked] = useState(false)
  let buttonTitle = ''
  let onButtonClick = null
  let onDialogPositiveTitle = ''
  let onDialogPositiveClick = () => {}

  const handleConnect = async () => {
    setOpenDialog(false)
    setSubscribingChecked(false)
    setInProgress(true)
    await onCreate(Number(subscribingChecked))
    setInProgress(false)
  }

  const handleDelete = async () => {
    setOpenDialog(false)
    setSubscribingChecked(false)
    setInProgress(true)
    await onDelete(Number(subscribingChecked))
    setInProgress(false)
  }

  const handleAccept = async () => {
    setOpenDialog(false)
    setSubscribingChecked(false)
    setRespondMenuAnchor(null)
    setInProgress(true)
    await onAccept(Number(subscribingChecked))
    setInProgress(false)
  }
  const handleReject = async () => {
    setOpenDialog(false)
    setSubscribingChecked(false)
    setRespondMenuAnchor(null)
    setInProgress(true)
    await onReject(Number(subscribingChecked))
    setInProgress(false)
  }

  if(areConnected) {
    buttonTitle = t('Delete connection')
    onDialogPositiveTitle = t('Delete')
    onDialogPositiveClick = handleDelete
    if(!isSubscribed) {
      onButtonClick = handleDelete
    } else {
      onButtonClick = () => setOpenDialog(true)
    }
  }
  else if(!areConnected && offerSent) {
    buttonTitle = t('Cancel request')
    onDialogPositiveTitle = t('Yes')
    onDialogPositiveClick = handleReject
    if(!isSubscribed) {
      onButtonClick = handleReject
    } else {
      onButtonClick = () => setOpenDialog(true)
    }
  }
  else if(!areConnected && offerReceived) {
    buttonTitle = t('Respond')
    onDialogPositiveTitle = t('Accept')
    onDialogPositiveClick = handleAccept
    onButtonClick = (e) => setRespondMenuAnchor(e.currentTarget)
  }
  else if(!areConnected) {
    buttonTitle = t('Connect')
    onDialogPositiveTitle = t('Connect')
    onDialogPositiveClick = handleConnect
    if(isSubscribed) {
      onButtonClick = handleConnect
    } else {
      onButtonClick = () => setOpenDialog(true)
    }
  }

  const [respondMenuAnchor, setRespondMenuAnchor] = useState(null)

  const dialog = <Dialog
    onClose={() => {
      setOpenDialog(false)
      setSubscribingChecked(false)
    }}
    open={openDialog}
    disableScrollLock
  >
    <DialogContent>
      <FormControlLabel
        control={
          <Checkbox
            checked={subscribingChecked}
            onChange={() => setSubscribingChecked(prev => !prev)}
          />
        }
        label={isSubscribed ? t('Unsubscribe') : t('Subscribe')}
      />
    </DialogContent>

    <DialogActions>
      <Button
        disableElevation
        onClick={() => {
          setOpenDialog(false)
          setSubscribingChecked(false)
        }}
        children={t('Close')}
      />
      <Button
        variant='contained'
        onClick={onDialogPositiveClick}
        children={onDialogPositiveTitle}
      />
    </DialogActions>

  </Dialog>

  return (
    <>
      <ClickAwayListener
        onClickAway={() => setRespondMenuAnchor(null)}
      >
        <div style={{position: 'relative'}}>
          { offerReceived &&
            <div
              style={{
                borderRadius: 100, height: 17, width: 17, background: '#de6231',
                position: 'absolute', top: -5, left: -8, zIndex: 1,
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                border: '1px solid white'
              }}
              children={<b>!</b>}
            />
          }
          <ButtonWithCircularProgress
          disableElevation
            variant='contained'
            children={buttonTitle}
            onClick={onButtonClick}
            enableProgress={inProgress}
            disabled={inProgress}
          />

          <PopperMenu
            open={!!respondMenuAnchor}
            anchorEl={respondMenuAnchor}
            dense
          >
            <MenuItem
              onClick={() => {
                if(!isSubscribed) {
                  setOpenDialog(true)
                } else {
                  handleAccept()
                }
              }}
              children={t('Accept request')}
            />
            <MenuItem
              onClick={handleReject}
              children={t('Reject request')}
            />
          </PopperMenu>
        </div>
      </ClickAwayListener>
      {dialog}
    </>
  )
}

export default ConnectionAction