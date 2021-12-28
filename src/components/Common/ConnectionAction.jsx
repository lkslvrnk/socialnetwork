import React, { useState } from 'react'
import { Button, Checkbox, ClickAwayListener, Dialog, DialogActions, DialogContent, FormControlLabel, MenuItem, Typography } from '@material-ui/core';
import ButtonWithCircularProgress from './ButtonWithCircularProgress';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { useTranslation } from 'react-i18next';
import PopperMenu from './PopperMenu';

const CREATE = 1
const DELETE = 2
const RESPOND = 3
const CANCEL = 4

const ConnectionAction = props => {
  const {
    areConnected,
    offerReceived,
    offerSent,
    onCreate,
    onAccept,
    onReject,
    onDelete
  } = props

  const { t } = useTranslation()

  const [inProgress, setInProgress] = useState(false)
  const [openDialog, setOpenDialog] = useState(false)
  const [subscribingChecked, setSubscribingChecked] = useState(false)

  let buttonTitle = ''
  let onButtonClick = null
  let actionType = CREATE

  if(areConnected) {
    buttonTitle = t('Delete connection')
    onButtonClick = async () => {
      setInProgress(true)
      await onDelete()
      setInProgress(false)
    }
    actionType = DELETE
  }
  else if(!areConnected && offerSent) {
    buttonTitle = t('Cancel request')
    onButtonClick = async () => {
      setInProgress(true)
      await onReject()
      setInProgress(false)
    }
    actionType = CANCEL
  }
  else if(!areConnected && offerReceived) {
    buttonTitle = t('Respond')
    onButtonClick = (e) => setRespondMenuAnchor(e.currentTarget)
    actionType = RESPOND
  }
  else if(!areConnected) {
    buttonTitle = t('Connect')
    onButtonClick = () => setOpenDialog(true)
  }

  const handleConnect = async () => {
    setOpenDialog(false)
    setSubscribingChecked(false)
    setInProgress(true)
    await onCreate(Number(subscribingChecked))
    setInProgress(false)
  }

  const handleAccept = async () => {
    setRespondMenuAnchor(null)
    setInProgress(true)
    await onAccept()
    setInProgress(false)
  }

  const handleReject = async () => {
    setRespondMenuAnchor(null)
    setInProgress(true)
    await onReject()
    setInProgress(false)
  }

  const [respondMenuAnchor, setRespondMenuAnchor] = useState(false)

  return (
    <>
      <ClickAwayListener
        onClickAway={() => setRespondMenuAnchor(null)}
      >
        <div >
          <ButtonWithCircularProgress
            variant='contained'
            startIcon={<PersonAddIcon />}
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
              onClick={handleAccept}
              children={t('Accept request')}
            />
            <MenuItem
              onClick={handleReject}
              children={t('Reject request')}
            />
          </PopperMenu>
        </div>
      </ClickAwayListener>

      <Dialog
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
            label={t('Subscribe?')}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false)
              setSubscribingChecked(false)
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleConnect}
          >
            {t('Connect')}
          </Button>
        </DialogActions>

      </Dialog>

      <Dialog
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
            label={t('Subscribe?')}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => {
              setOpenDialog(false)
              setSubscribingChecked(false)
            }}
          >
            {t('Cancel')}
          </Button>
          <Button
            variant='contained'
            onClick={handleConnect}
          >
            {t('Connect')}
          </Button>
        </DialogActions>

      </Dialog>
    </>
  )
}

export default ConnectionAction