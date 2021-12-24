import React, { useState, useEffect, useRef } from 'react';
import RightProfilePanel from './RightProfilePanel/RightProfilePanel.js'
import { connect, useDispatch, useSelector } from 'react-redux'
import { compose } from 'redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './ProfileStyles';
import 'emoji-mart/css/emoji-mart.css'
import { change } from 'redux-form'
import { cleanProfile, getUserById, createSubscription, deleteSubscription } from '../../redux/profile_reducer'
import { getPosts, createPost, deletePost, addPostPhoto, removeNewPostPhoto, cleanNewPostPhotos, getMorePosts, restorePost } from '../../redux/profile_posts_reducer'
import { createConnection, deleteConnection, acceptConnection } from '../../redux/profile_reducer';
import { addPhoto } from '../../redux/photos_reducer'
import { Avatar, Button, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Paper } from '@material-ui/core';
import { usePrevious } from '../../hooks/hooks.js';
import PostForm from './PostForm.js';
import Preloader from '../Common/Preloader/Preloader.jsx';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ProfileAvatar from './ProfileAvatar/ProfileAvatar';
import Typography from "@material-ui/core/Typography";
import StickyPanel from '../Common/StickyPanel.js';
import moment from 'moment';
import { Divider } from '@material-ui/core';
import { NavLink, useParams } from 'react-router-dom';
import { AvatarGroup } from '@material-ui/lab';
import MessageIcon from '@material-ui/icons/Message';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import Skeleton from '@material-ui/lab/Skeleton';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import { baseUrl } from '../../api/api';
import WcIcon from '@material-ui/icons/Wc';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CakeIcon from '@material-ui/icons/Cake';
import ProfilePost from '../ProfilePost/ProfilePost.js';
import PostSkeleton from '../Common/PostSkeleton.js';

const Profile = React.memo(props => {

  const { postsLoaded, deletePost, restorePost, posts, currentUserId, profile, postsCursor, postsCount } = props
  
  const mobile = useMediaQuery('(max-width: 860px)')
  const xs = useMediaQuery('(max-width: 500px)')
  const params = useParams()
  const dispatch = useDispatch()
  const classes = useStyles({ 'matches800': true })
  const { t } = useTranslation();
  let wall = React.useRef(null)
  const [morePostsLoading, setMorePostsLoading] = useState(false)
  const [connectionActionInProgress, setConnectionActionInProgress] = useState(false)
  const [subscriptionActionInProgress, setSubscriptionActionInProgress] = useState(false)
  const usernameFromUrl = params.username
  const ownerFullName = !!profile && `${profile.firstName} ${profile.lastName}`
  const profileLoaded = !!profile && profile.username === usernameFromUrl

  const coverSrc = 'https://s1.1zoom.ru/big0/596/Evening_Forests_Mountains_Firewatch_Campo_Santo_549147_1280x720.jpg' 
  const currentUserUsername = useSelector(getCurrentUserUsername)

  const isOwnProfile = usernameFromUrl === currentUserUsername
  const prevProfileId = usePrevious(profile ? profile.id : undefined)

  const onOwnWall = currentUserId === (profile ? profile.id : '-1')

  const loadMorePostsButton = useRef(null)

  const handleLoadMorePosts = async () => {
    if(!morePostsLoading && postsLoaded && !!profile && postsCursor) {
      setMorePostsLoading(true)
      await dispatch(getMorePosts(profile.id, 5, postsCursor, 'DESC', 2, 'DESC'))
      setMorePostsLoading(false)
    }
  }

  useEffect(() => {
    if(!!profile) {
      document.title = ownerFullName
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  useEffect(() => {
    window.scrollTo(0, 0)

    return () => {
      dispatch(cleanProfile())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    (function() {
      if(!profile || (profile && profile.username !== usernameFromUrl)) {
        if(profile) {
          dispatch(cleanProfile())
        }
        dispatch(getUserById(usernameFromUrl))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromUrl])

  useEffect(() => {
    var options = {
      root: null,
      rootMargin: '100px',
      threshold: 0.1
    }
    var callback = function(entries, observer) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          handleLoadMorePosts()
        }
      })
    };
    var observer = new IntersectionObserver(callback, options);
    observer.observe(loadMorePostsButton.current)

    return () => observer.disconnect()
  })

  useEffect(() => {
    if((!postsLoaded || (!!profile && profile.id !== prevProfileId))
      && (!!profile && profile.postsCount)
    ) {
      dispatch(getPosts(profile.id, 5, null, 'DESC', 2, 'DESC'))
    }
  }, [postsLoaded, dispatch, profile, prevProfileId])

  let postsList = posts.map(post => {
    return (
      <ProfilePost
        onDelete={() => deletePost(post.id)}
        onRestore={() => restorePost(post.id)}
        onOwnWall={onOwnWall}
        key={post.id}
        postData={post}
        wallWidth={500}
        embeddedPost={post.embeddedPost}
        inList={true}
        userIsAuthenticated={currentUserId}
      />
    )
  })
  let postsSkeletonsList = [0, 1, 2].map((e) => <PostSkeleton key={e} />)

  const onPost = async (text, attachments, isPublic, disableComments) => {
    return dispatch(createPost(text, attachments, isPublic, disableComments, 0, null))
  }

  let buttonsSection = null
  let buttonsSectionClass = mobile ? classes.buttonsSectionMobile : classes.buttonsSection
  let buttonSkeletonHeight = 36

  if(profileLoaded && isOwnProfile) {
    buttonsSection = (
      <div className={buttonsSectionClass}>
        <Button
          disabled
          variant='contained'
          startIcon={<EditIcon />}
        >
          {t('Edit profile')}
        </Button>
      </div>
    )
  }
  else if(profileLoaded && !isOwnProfile) {
    const connection = profile.connection
    const areConnected = connection && connection.isAccepted
    const currentUserInitiatorOfConnection = connection && connection.initiator.id === currentUserId
    const ownerOfProfileInitiatorOfConnection = connection && connection.initiator.id === profile.id
  
    const connectRequest = async () => {
      if(!connection) {
        return dispatch(createConnection(profile.id))
      }
      else if(!!connection && !areConnected && currentUserInitiatorOfConnection) {
        return dispatch(deleteConnection(connection.id))
      }
      else if(!!connection && !areConnected && ownerOfProfileInitiatorOfConnection) {
        return dispatch(acceptConnection(connection.id))
      }
      else if(!!connection && areConnected) {
        return dispatch(deleteConnection(connection.id))
      }
      return null
    }

    const subscription = profile.subscription

    const subscriptionRequest = async () => {
      if(!subscription) {
        return dispatch(createSubscription(profile.id))
      }
      else {
        return dispatch(deleteSubscription(subscription.id))
      }
    }
  
    const onConnectButtonClick = () => {
      if(connectionActionInProgress) {
        return
      }
      setConnectionActionInProgress(true)
      connectRequest()
        .then(() => setConnectionActionInProgress(false), () => setConnectionActionInProgress(false))
    }

    const onSubscriptionButtonClick = () => {
      if(subscriptionActionInProgress) {
        return
      }
      setSubscriptionActionInProgress(true)
      subscriptionRequest()
        .then(() => setSubscriptionActionInProgress(false), () => setSubscriptionActionInProgress(false))
    }
  
    let connectButtonTitle = ''
    let tooltipTitle = ''
  
    if(!!connection && areConnected) {
      connectButtonTitle = t('Delete from contacts')
    }
    else if(Boolean(connection) && !areConnected && currentUserInitiatorOfConnection) {
      connectButtonTitle = t('Cancel request')
      tooltipTitle = t('You offered to set up a contact, press if you want to cancel')
    }
    else if(Boolean(connection) && !areConnected && ownerOfProfileInitiatorOfConnection) {
      connectButtonTitle = t('Accept request')
      tooltipTitle = t('You have been offered to set up a contact, press if you want to refuse')
    }
    else if(!Boolean(connection)) {
      connectButtonTitle = t('Offer contact')
    }

    let subscribeButtonTitle = ''
    if(!!subscription) {
      subscribeButtonTitle = t('Unsubscribe')
    } else {
      subscribeButtonTitle = t('Subscribe')
    }
  
    buttonsSection = (
      <div className={buttonsSectionClass} >
        <div>
          { !profile.banned &&
            <Button color='primary' variant="contained" startIcon={<MessageIcon />}>
              {t('Message')}
            </Button> }
        </div>

        <div id='subscription' >
          { !profile.banned &&
            <div style={{display: 'flex', position: 'relative'}} >
              <Button disabled={ subscriptionActionInProgress } color='secondary' variant="contained" onClick={onSubscriptionButtonClick}>
                {subscribeButtonTitle}
              </Button>

              { subscriptionActionInProgress &&
                <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
                  <Preloader color='secondary' size={32} />
                </div>
              }
            </div>
          }
        </div>

        <div id='connection' >
          { !profile.banned &&
          <div style={{display: 'flex', position: 'relative'}} >
            <Tooltip  title={tooltipTitle} arrow>
              <Button
                disabled={connectionActionInProgress}
                onClick={onConnectButtonClick}
                variant="contained"
                startIcon={<PersonAddIcon />}
              >
                {connectButtonTitle}
              </Button>
            </Tooltip>
            { connectionActionInProgress &&
              <div style={{ position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, display: 'flex', justifyContent: 'center', alignItems: 'center'}} >
                <Preloader color='secondary' size={32} />
              </div>
            }
            
          </div>
          }
        </div>
      </div>
    )
  }
  else if(!profileLoaded && isOwnProfile) {
    buttonsSection = <div className={buttonsSectionClass} >
      <Skeleton
        className={classes.buttonSkeleton}
        variant='rect'
        width={150}
        height={buttonSkeletonHeight}
      />
    </div>
  }
  else if(!profileLoaded && !isOwnProfile) {
    buttonsSection = (
      <div className={buttonsSectionClass}>
        { [150, 120, 170].map(width => {
          return (
            <div>
              <Skeleton
                className={classes.buttonSkeleton}
                variant='rect'
                width={width}
                height={buttonSkeletonHeight}
              />
            </div>
          )
        })}
      </div>
    )
  }

  const avatar = (
    mobile
    ?
    <ProfileAvatar isOwnProfile={onOwnWall} currentUserId={currentUserId} />
    : 
    <div className={classes.avatarFrame} >
      <ProfileAvatar isOwnProfile={onOwnWall} currentUserId={currentUserId} />
    </div>
  )

  const avatarSkeleton = (
    mobile
    ?
    <div className={classes.sleletonBackground} >
      <Skeleton variant='circle' width={150} height={150} />
    </div>
    :
    <div className={classes.avatarFrame} >
      <div className={classes.sleletonBackground} >
        <Skeleton variant='circle' width={200} height={200} />
      </div>
    </div>
  )

  const cover = (
    <div
      className={classes.cover}
      style={{
        backgroundImage: profileLoaded
          ? `url(${coverSrc})` : 'none',
      }}
    >
    { !profileLoaded &&
      <Skeleton variant='rect'
        style={{
          borderTopLeftRadius: 3,
          borderTopRightRadius: 3,
          position: 'absolute',
          top: 0, left: 0, bottom: 0, right: 0,
          paddingBottom: '33%'
        }}
      />
    }
    </div>
  )

  const profileHeader = (
    <Paper className={classes.profileHeader} >
      { cover }

      <div style={{ position: 'relative', height: 180, display: 'flex', padding: 16 }} >
        <div className={classes.avatarSection}>
          <div className={classes.avatarContainer} >
            { profileLoaded ? avatar : avatarSkeleton }
          </div>
        </div>
        
        <div>
          <div className={ classes.name}>
            { profileLoaded ?
              <Typography variant='h5' >{ ownerFullName }</Typography>
              : <Skeleton variant='text' width={250} height={40} />
            }
          </div>

          { profileLoaded ?
            <>
              <Typography variant='body1' color='textSecondary' >Черкассы, Украина</Typography>
              <Typography variant='body1' color='textSecondary' >
                Контактов:&nbsp;
                <NavLink
                  style={{color: 'white', textDecoration: 'none'}}
                  to={`/i/${profile.username}/contacts`}
                >{profile.allAcceptedConnections}</NavLink>
              </Typography>
            </>
            :
            <><Skeleton variant='text' width={150} height={20} />
            <Skeleton variant='text' width={150} height={20} /></>
          }

          { profileLoaded &&
            <div style={{position: 'relative', zIndex: 0}} >
            <AvatarGroup max={6}>
              { profile.acceptedConnections.map(conn => {
                let contactPicture = `${baseUrl}/images/for-photos/${conn.initiator.id === profile.id ? conn.target.picture : conn.initiator.picture}`
                let contactLink = `/i/${conn.initiator.id === profile.id ? conn.target.username : conn.initiator.username}`

                return <Avatar
                  component={NavLink}
                  to={contactLink} 
                  sx={{ width: 56, height: 56 }}
                  src={contactPicture}
                />
              })}
            </AvatarGroup>
            </div>
          }
        </div>

        { !mobile && buttonsSection }
      </div>
      { mobile && buttonsSection }
    </Paper>
  )

  const panelSkeleton = (
    <div style={{ width: 300,  }}>
      { [1,2,3,4].map(section => {
        return <Paper key={section} style={{ padding:16, marginBottom: 16 }}>
          <Skeleton variant='text' width={150} />
          { [1,2,3,4].map(item => {
            return <div key={item} style={{display: 'flex', marginTop: 8}}>
              <Skeleton style={{marginRight: 16}} variant='circle' height={30} width={30} />
              <Skeleton variant='text' height={20} width={150} />
            </div>
          })}
        </Paper>
      })}
    </div>
  )

  let mainInfo = [
    {key: 0, icon: <LocationOnIcon />, text: !!profile ? profile.city + ', ' + profile.country : null }, 
    {key: 1, icon: <WcIcon />, text: !!profile ? profile.gender : null},
    {key: 2, icon: <CakeIcon />, text: !!profile ? moment(profile.birthday).format("DD MMMM YYYY") : null} 
  ]

  const mobileInfoSection = ( mobile ?
    <Paper style={{marginBottom: 16}} >
      <List
        className={classes.mainInfoList}
        dense={true}
        subheader={<li />}
      >
        <ListSubheader disableSticky={true} >
          {t('Brief info')}
        </ListSubheader>

        {mainInfo.map(item => {
          
          return (
            <ListItem key={item.key} >
              <ListItemIcon style={{ minWidth: 32}} >
                {!!profile ? item.icon : <Skeleton variant="circle" width={24} height={24} /> }
              </ListItemIcon>

              <ListItemText
                primary={ !!profile
                  ? <Typography variant='body2' >{item.text}</Typography>
                  : <Skeleton height={20} width={100} /> 
                }
              />
            </ListItem>
          )})}
      </List>
    </Paper>
    :
    null
  )

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

      <div className={classes.photosMobile} style={{display: 'flex', justifyContent: 'center'}} >
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

  const mobilePhotosSection = (mobile &&
    ( !!profile ?
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
    )
  )

  const profileBody = (
    <div className={ classes.profileBody } >
      { mobileInfoSection }
      { mobilePhotosSection }

      <div ref={ wall } className={ classes.wall }  >
        { isOwnProfile && profileLoaded &&
          <Paper>
            <PostForm onSubmit={ onPost } />
          </Paper>
        }
        { isOwnProfile && !profileLoaded &&
          <Paper style={{padding: 8}}>
            <div style={{marginBottom: 8, display: 'flex', justifyContent: 'space-between'}}>
              <Skeleton variant='text' width={200} />
              <Skeleton variant='circle' width={20} height={20} />
            </div>
            <Divider />
            <Skeleton
              variant='rect' width={150} height={40}
              style={{ borderRadius: 3, marginLeft: 'auto', marginTop: 24}}
            />
          </Paper>
        }
        { !profile || !postsLoaded
          ? postsSkeletonsList
          : postsList
        }
        { !!profile && postsCount === 0 &&
          <Paper className={classes.noPosts} >
            {/* <LocalFloristIcon style={{width: 150, height: 150}} /> */}
            <div style={{ fontSize: '130px' }}><span role="img">🐮</span></div>
            <Typography variant='h6' >
              {t('Публикаций пока нет')}
            </Typography>
          </Paper>
        }
        <div style={{display: 'flex', justifyContent: 'center'}} ref={loadMorePostsButton} >
        { postsLoaded && !!profile && !!postsCursor &&     
            (morePostsLoading
              ? <Preloader />
              : <Button onClick={handleLoadMorePosts} >Загрузить ещё</Button>)
        }
        </div>
      </div>

      { !mobile &&
        <StickyPanel top={55} >
          { profileLoaded ?
            <RightProfilePanel
              isLoading={!Boolean(profile)}
              profile={profile}
              isOwnProfile={onOwnWall}
              currentUserId={currentUserId}
            />
            :
            panelSkeleton
          }
        </StickyPanel>
      }
    </div>
  )

  return (
    <div className={classes.profile} >
      { profileHeader }
      { profileBody }
    </div>
  )
})

let mapStateToProps = state => {
  return {
    newPostPhotos: state.profile.newPostPhotos,
    postsLoaded: state.profilePosts.areLoaded,
    posts: state.profilePosts.posts,
    postsCursor: state.profilePosts.cursor,
    postsCount: state.profilePosts.allCount,
    profile: state.profile.profile,
    currentUserId: state.auth.id,
  }
}

let functions = {
  change, deletePost, restorePost, addPhoto, addPostPhoto, removeNewPostPhoto, cleanNewPostPhotos
}

export default compose(
  connect(mapStateToProps, functions)
)(Profile);