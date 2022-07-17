import React from 'react';
import { ListSubheader, Paper, useMediaQuery } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStyles } from '../ProfileStyles';
import { useTranslation } from 'react-i18next';
import classNames from 'classnames';

const MobilePhotosSection = React.memo(props => {

  const profileLoaded = props.profileLoaded
  const pictures = props.pictures
  const handlePhotoClick = props.handlePhotoClick

  const xs = useMediaQuery('(max-width: 500px)')
  const sm = useMediaQuery('(max-width: 860px)')
  const { t } = useTranslation()
  const classes = useStyles()

  const preparedPhotos = []
  const count = xs ? 5 : 4
  for(let i = 0; i < count; i++) {
    if(pictures[i]) {
      preparedPhotos.push(pictures[i])
    }
  }

  const mobileMediaSectionSkeleton = (
    sm ?
    <Paper style={{padding: 16, marginBottom: 16}}>
      <div style={{marginBottom: 16}}>
        <Skeleton variant='text' height={20} width={100} />
      </div>

      <div className={classes.photosMobile} >
        {(xs ? [0,1,2,3,4] : [0,1,2,3]).map((photo) => (
          <Skeleton
            key={photo}
            variant='rect'
            component='div'
            width={(sm && !xs) ? '19%' : '24%'}
            style={{
              flexShrink: 0,
              paddingBottom: (sm && !xs) ? '19%' : '24%',
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
    <Paper
      component='section'
      className={classes.photosMobileSection}
    >
      <ListSubheader disableSticky={true}>
        {t('Photos')}
      </ListSubheader>

      <div className={classes.photosMobile} >
        {preparedPhotos.map((photo, index) => {
          return (
            <div 
              className={classNames(
                classes.photo, sm && !xs ? classes.photoSM : classes.photoXS
              )}
              onClick={() => handlePhotoClick(index)}
              key={index}
              style={{
                backgroundImage: `url(${photo.src})`,
              }}
            />
          )
        })}
      </div>
    </Paper>
    :
    mobileMediaSectionSkeleton
})

export default MobilePhotosSection