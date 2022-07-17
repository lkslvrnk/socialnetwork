import React from 'react';
import {useTranslation} from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';

type AcceptDialogType = {
  show: boolean,
  setShow: Function,
  onYes: Function,
  title: string,
  text: string
}

const AcceptDialog: React.FC<AcceptDialogType> = React.memo((props: AcceptDialogType) => {
  const { show, setShow, onYes, text } = props
  
  const { t } = useTranslation();
  const handleClose = () => {
    setShow(false)
  }
  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={show}
    >
      <DialogContent >
        <Typography variant='body1'>{text}</Typography>
      </DialogContent>
      
      <DialogActions>
        <Button
          onClick={() => setShow(false)}
        >
          {t('Cancel')}
        </Button>
        <Button
          onClick={() => onYes()}
        >
          {t('Yes')}
        </Button>
      </DialogActions>
      
    </Dialog>
  )
})

export default AcceptDialog
