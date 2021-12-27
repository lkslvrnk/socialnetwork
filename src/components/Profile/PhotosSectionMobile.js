import React, { useState } from 'react';
import { ListSubheader, Paper, useMediaQuery } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStyles } from './ProfileStyles';
import { useTranslation } from 'react-i18next';
import { imagesStorage } from '../../api/api';
import PhotoViewer from '../PhotoViewer/PhotoViewer';

const PhotosSectionMobile = React.memo(props => {

  const profileLoaded = props.profileLoaded
  const pictures = props.pictures
  const handlePhotoClick = props.handlePhotoClick

  const xs = useMediaQuery('(max-width: 500px)')
  const mobile = useMediaQuery('(max-width: 860px)')
  const { t } = useTranslation()
  const classes = useStyles()

  const preparedPhotos = []

  const count = xs ? 4 : 5
  for(let i = 0; i < count; i++) {
    if(pictures[i]) {
      preparedPhotos.push(pictures[i])
    }
  }

  const mobileMediaSectionSkeleton = (
    mobile ?
    <Paper style={{padding: 16, marginBottom: 16}}>
      <div style={{marginBottom: 16}}>
        <Skeleton variant='text' height={20} width={100} />
      </div>

      <div className={classes.photosMobile} >
        {(xs ? [0,1,2,3] : [0,1,2,3,4]).map((photo) => (
          <Skeleton
            key={photo}
            variant='rect'
            component='div'
            width={(mobile && !xs) ? '19%' : '24%'}
          
            style={{
              flexShrink: 0,
              paddingBottom: (mobile && !xs) ? '19%' : '24%',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          />
        ))}
      </div>
    </Paper>
    :
    null
  )

  return profileLoaded
    ?
    <Paper style={{padding: 0, marginBottom: 16}} >
      <ListSubheader disableSticky={true}>
        {t('Photos')}
      </ListSubheader>

      <div className={classes.photosMobile} style={{padding: '0 16px 16px 16px', display: 'flex', justifyContent: 'center'}} >
        {preparedPhotos.map((photo, index) => {
          console.log(photo)
          return (
            <div
              onClick={() => handlePhotoClick(index)}
              key={index}
              style={{
                flexShrink: 0,
                backgroundImage: `url(${photo.src})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                width: (mobile && !xs) ? '19%' : '24%',
                paddingBottom: (mobile && !xs) ? '19%' : '24%',
                borderRadius: 4,
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            />
          )
        })}
      </div>


    </Paper>
    :
    mobileMediaSectionSkeleton
  
})

export default PhotosSectionMobile