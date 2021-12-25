import React from 'react';
import { ListSubheader, Paper, useMediaQuery } from '@material-ui/core';
import Skeleton from '@material-ui/lab/Skeleton';
import { useStyles } from './ProfileStyles';
import { useTranslation } from 'react-i18next';


const PhotosSectionMobile = React.memo(props => {

  const profileLoaded = props.profileLoaded
  const xs = useMediaQuery('(max-width: 500px)')
  const mobile = useMediaQuery('(max-width: 860px)')
  const { t } = useTranslation()
  const classes = useStyles({ 'matches800': true })

  let photos = [
    {src: "https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/26/5c/c9/265cc9b2-2dc6-2499-9728-f1fd5c837184/source/256x256bb.jpg"},
    {src: "https://is1-ssl.mzstatic.com/image/thumb/Purple71/v4/c8/36/9f/c8369fa9-9dbb-fbb3-1ffc-542d95e019e9/source/256x256bb.jpg"},
    {src: "https://static-s.aa-cdn.net/img/gp/20600002404286/pRD2XG5X2KqiDoA4L1eNJFlN4_7ghS8cPiMux_wWEDVKzASYPJSsSMQ6580qan62ydRV=w300?v=1"},
    {src: "https://s9.travelask.ru/uploads/post/000/005/876/main_image/full-a04f69d2e8e7a0364ea5805bb21a9117.jpg"},
    {src: "http://forumsmile.ru/u/1/4/f/14fd113eac8b7e6f9381b2653e4badf1.jpg"},
  ]

  if(xs) {
    photos = [
      {src: "https://is3-ssl.mzstatic.com/image/thumb/Purple113/v4/26/5c/c9/265cc9b2-2dc6-2499-9728-f1fd5c837184/source/256x256bb.jpg"},
      {src: "https://is1-ssl.mzstatic.com/image/thumb/Purple71/v4/c8/36/9f/c8369fa9-9dbb-fbb3-1ffc-542d95e019e9/source/256x256bb.jpg"},
      {src: "https://static-s.aa-cdn.net/img/gp/20600002404286/pRD2XG5X2KqiDoA4L1eNJFlN4_7ghS8cPiMux_wWEDVKzASYPJSsSMQ6580qan62ydRV=w300?v=1"},
      {src: "https://s9.travelask.ru/uploads/post/000/005/876/main_image/full-a04f69d2e8e7a0364ea5805bb21a9117.jpg"},
    ]
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
        {photos.map((photo, index) => (
          <div key={index}
            style={{
              flexShrink: 0,
              backgroundImage: `url(${photo.src})`,
              backgroundSize: 'cover',
              width: (mobile && !xs) ? '19%' : '24%',
              paddingBottom: (mobile && !xs) ? '19%' : '24%',
              borderRadius: 4,
              overflow: 'hidden'
            }}
          />
        ))}
      </div>
    </Paper>
    :
    mobileMediaSectionSkeleton
  
})

export default PhotosSectionMobile