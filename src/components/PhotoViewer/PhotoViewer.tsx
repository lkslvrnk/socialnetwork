import React, { FC, memo, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './PhotoViewerStyles.js'
import { Button, ClickAwayListener, InputBase, List, ListItem, ListItemText, Paper } from '@material-ui/core'
import { AppStateType } from '../../redux/redux_store.js';
import { ProfilePictureType, SimplePhotoType } from '../../types/types';
import { imagesStorage } from '../../api/api';

type PropsType = {
  photos: Array<SimplePhotoType>
  openedPhotoId: string | null
  handleClose: Function
}

const PhotoViewer: FC<PropsType> = memo((props: PropsType) => {
  console.log(props)
  let photos = props.photos
  let firstPhotoId = photos.length ? photos[0].id : null
  const handleClose = props.handleClose

  const [openedPhotoId, setOpenedPhotoId] = useState<string | null>(props.openedPhotoId ? props.openedPhotoId : firstPhotoId)

  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const users = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)
  const loadMoreButton = useRef(null)
  const [moreResultsLoading, setMoreResultsLoading] = useState(false)
  const location = useLocation()
  const history = useHistory()

  let openedPhoto = photos.find(photo => photo.id === openedPhotoId)


  return (
    <ClickAwayListener onClickAway={() => handleClose()}>
      <Paper style={{position: 'fixed', top: 60, left: 60, right: 60, bottom: 60}}>
        { !openedPhoto
          ? <div>Фото нет</div>
          : 
          <img
            src={`${imagesStorage}${openedPhoto.src}`}
          />
        }
      </Paper>
    </ClickAwayListener>
  )
})

export default PhotoViewer
