import React, { useState, useEffect, useRef } from 'react';
import RightProfilePanel from './RightProfilePanel/RightProfilePanel.js'
import { connect, useDispatch, useSelector } from 'react-redux'
import { compose } from 'redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './ProfileStyles';
import 'emoji-mart/css/emoji-mart.css'
import { change } from 'redux-form'
import { cleanProfile, getUserById} from '../../redux/profile_reducer'
import {
  getPosts, createPost, deletePost, addPostPhoto,
  removeNewPostPhoto, cleanNewPostPhotos, getMorePosts, restorePost
} from '../../redux/profile_posts_reducer'
import { addPhoto } from '../../redux/photos_reducer'
import {
  Avatar, Button, IconButton, List, ListItem, ListItemIcon, ListItemText, ListSubheader, Paper
} from '@material-ui/core';
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
import EditIcon from '@material-ui/icons/Edit';
import Skeleton from '@material-ui/lab/Skeleton';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import { imagesStorage } from '../../api/api';
import WcIcon from '@material-ui/icons/Wc';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import CakeIcon from '@material-ui/icons/Cake';
import ProfilePost from '../ProfilePost/ProfilePost.js';
import PostSkeleton from '../Common/PostSkeleton.js';
import Communication from './Communication.js';
import PhotosSectionMobile from './PhotosSectionMobile.js';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import PhotoViewer from '../PhotoViewer/PhotoViewer';
import Carousel, { Modal, ModalGateway } from "react-images";
import ImageGallery from 'react-image-gallery';
import { PhotoProvider, PhotoConsumer, PhotoSlider } from 'react-photo-view';
import 'react-photo-view/dist/index.css';
import RssFeedIcon from '@material-ui/icons/RssFeed';
import TypographyLink from '../Common/TypographyLink.jsx';
import SubscriptionsIcon from '@material-ui/icons/Subscriptions';
import Info from './Info.js';
import MyAvatarEditor from './ProfileAvatar/MyAvatarEditor.js';
import CoverEditor from './ProfileAvatar/CoverEditor.js';

const Profile = React.memo(props => {

  const { postsLoaded, deletePost, restorePost, posts, currentUserId, profile, profileLoaded, postsCursor, postsCount } = props
  
  console.log('Profile rerender')

  const mobile = useMediaQuery('(max-width: 860px)')

  const isAuthenticated = !!currentUserId
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)

  const params = useParams()
  const dispatch = useDispatch()
  const classes = useStyles()
  const { t } = useTranslation()
  let wall = React.useRef(null)
  const [morePostsLoading, setMorePostsLoading] = useState(false)

  const usernameFromUrl = params.username

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setViewerIsOpen(true);
  }

  const closeLightbox = () => {
    setCurrentImageIndex(0);
    setViewerIsOpen(false);
  };

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
    if((!postsLoaded || (!!profile && profile.id !== prevProfileId))
      && (!!profile && profile.postsCount)
    ) {
      dispatch(getPosts(profile.id, 5, null, 'DESC', 2, 'DESC'))
    }
    setShowAvatarEditor(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const prevProfileId = usePrevious(profile ? profile.id : undefined)
  const currentUserUsername = useSelector(getCurrentUserUsername)

  if(profileLoaded && !profile) {
    return <div style={{display: 'flex', flexDirection: 'column', padding: 16, justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <span role='img' aria-label='no-subscribers' style={{ fontSize: '130px' }}>
          🐷
        </span>
      <Typography variant='h4' >{t('Profile not found')}</Typography>
    </div>
  }

  const reversedPictures = profile ? [...profile.pictures].reverse() : []

  const preparedSmallPictures = []
  const preparedLargePictures = []
  
  reversedPictures.forEach((picture) => {
    const id = picture.id
    const smallSrc = `${imagesStorage}${picture.versions.small.src}`
    // const largeSrc = `${imagesStorage}${picture.versions.large}`
    const originalSrc = `${imagesStorage}${picture.versions.original.src}`
    preparedSmallPictures.push({id, src: smallSrc})
    preparedLargePictures.push({
      id,
      src: originalSrc
    })
  })

  const onAvatarClick = () => {
    openLightbox(0)
  }

  const ownerFullName = !!profile && `${profile.firstName} ${profile.lastName}`

  const coverSrc = 'https://s1.1zoom.ru/big0/596/Evening_Forests_Mountains_Firewatch_Campo_Santo_549147_1280x720.jpg' 
  

  const isOwnProfile = usernameFromUrl === currentUserUsername
  

  const onOwnWall = currentUserId === (profile ? profile.id : '-1')

  const handleLoadMorePosts = async () => {
    if(!morePostsLoading && postsLoaded && !!profile && postsCursor) {
      setMorePostsLoading(true)
      await dispatch(getMorePosts(profile.id, 5, postsCursor, 'DESC', 2, 'DESC'))
      setMorePostsLoading(false)
    }
  }

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

  let editProfileButton = false &&
    (profileLoaded
      ? 
      <div className={classes.buttonsSection}>
        <Button
          disabled
          variant='contained'
          startIcon={<EditIcon />}
        >
          {t('Edit profile')}
        </Button>
      </div>
      :
      <div className={classes.buttonsSection} >
        <Skeleton
          className={classes.buttonSkeleton}
          variant='rect'
          width={150}
          height={36}
        />
      </div>
    )

  let renderProfilePicture = (
    <ProfileAvatar
      onClick={onAvatarClick}
      isOwnProfile={onOwnWall}
      currentUserId={currentUserId}
    />
  )

  const avatar = (
    mobile
    ? renderProfilePicture
    : 
    <div className={classes.avatarFrame} >
      {renderProfilePicture}
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
        backgroundImage: profileLoaded ? `url(${profile.cover ? `${imagesStorage}${profile.cover.versions.cropped_large}` : coverSrc })` : 'none',
      }}
    >
      { isOwnProfile && <Paper className={classes.editButtonRoot} style={{position: 'absolute', bottom: 5, right: 5}} >
        <IconButton
          size='small'
          onClick={() => setShowAvatarEditor(true)}
        >
          <EditIcon />
        </IconButton>
      </Paper>
      }
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
        <CoverEditor
          currentUserId={currentUserId} 
          show={showAvatarEditor} 
          setShow={setShowAvatarEditor}
        />
    </div>
  )

  const communication = !isOwnProfile && isAuthenticated &&
    <Communication
      currentUserId={currentUserId}
      profile={profile}
      profileLoaded={profileLoaded}
    />

  const profileHeader = (
    <Paper
      component='section'
      className={classes.headerRoot}
    >
      { cover }

      <div className={classes.header} >
        <div className={classes.avatarSection}>
          <div className={classes.avatarContainer} >
            { profileLoaded ? avatar : avatarSkeleton }
          </div>
        </div>
        
        <div className={classes.nameAndContacts}>
          <div className={ classes.name}>
            { profileLoaded
              ? <>
                <Typography variant='h4' style={{ fontWeight: 500 }}>
                  {profile.firstName}&nbsp;
                </Typography>
                <Typography variant='h4' style={{ fontWeight: 500 }}>
                  {profile.lastName}
                </Typography>
              </>
              : <Skeleton variant='text' width={250} height={40} />
            }
          </div>

          { profileLoaded ?
            <>
              {profile.allAcceptedConnections > 0 &&
                <TypographyLink
                  to={`/i/${profile.username}/contacts`}
                  variant='h6'
                >
                  {t('Contacts')}:&nbsp;{profile.allAcceptedConnections}
                </TypographyLink>
              }
            </>
            :
            <><Skeleton variant='text' width={150} height={20} />
            <Skeleton variant='text' width={150} height={20} /></>
          }

          { profileLoaded &&
            <div style={{position: 'relative', zIndex: 0}} >
            <AvatarGroup max={6}>
              { profile.acceptedConnections.map(conn => {
                let pictureSrc = conn.initiator.id === profile.id
                  ? conn.target.picture : conn.initiator.picture
                let contactPicture = `${imagesStorage}/${pictureSrc}`
                let contactLink = `/i/${conn.initiator.id === profile.id
                  ? conn.target.username : conn.initiator.username}`

                return <Avatar
                  key={conn.id}
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

        { !mobile &&
          <>
            {editProfileButton}
            {communication}
          </>
        }
      </div>

      { mobile &&
        <>
          {editProfileButton}
          {communication}
        </>
      }
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

  const infoSection = <Info profile={profile} />

  const profileBody = (
    <section className={ classes.profileBody } >
      { mobile && 
        <section style={{marginBottom: 16}}>
          {infoSection}
        </section>
      }
      { mobile && preparedSmallPictures.length > 0 &&
        <PhotosSectionMobile
          handlePhotoClick={openLightbox}
          pictures={preparedSmallPictures}
          profileLoaded={profileLoaded}
        />
      }

      <div ref={ wall } className={ classes.wall }  >
        { isOwnProfile && profileLoaded &&
          <Paper>
            <PostForm onSubmit={ onPost } />
          </Paper>
        }
        { isOwnProfile && !profileLoaded &&
          <Paper className={classes.postFormSkeleton} >
            <div className={classes.postFormSkeletonInput} >
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
            <span role='img' aria-label='no-posts' style={{ fontSize: '130px' }}>
              🐱
            </span>
            <Typography variant='h6' >
              {t('No posts yet')}
            </Typography>
          </Paper>
        }
        <div className={classes.loadMore} >
          { postsLoaded && !!profile && !!postsCursor &&
            <ButtonWithCircularProgress
              onClick={handleLoadMorePosts}
              enableProgress={morePostsLoading}
              disabled={morePostsLoading}
              variant='contained'
              children={t('Load more')}
            />
          }
        </div>
      </div>

      { !mobile &&
        <StickyPanel top={55} >
          { profileLoaded ?
            <RightProfilePanel
              onPhotoClick={openLightbox}
              pictures={preparedSmallPictures}
              isLoading={!Boolean(profile)}
              profile={profile}
              isOwnProfile={onOwnWall}
              currentUserId={currentUserId}
              infoSection={infoSection}
            />
            :
            panelSkeleton
          }
        </StickyPanel>
      }

      {/* <ModalGateway>
        {viewerIsOpen ? (
          <Modal onClose={closeLightbox}>
            <Carousel
              showArrows={true}
              currentIndex={currentImageIndex}
              views={preparedLargePictures}
            />
          </Modal>
        ) : null}
      </ModalGateway> */}
      <PhotoSlider 
        images={preparedLargePictures}
        visible={viewerIsOpen}
        onClose={closeLightbox}
        index={currentImageIndex}
        onIndexChange={setCurrentImageIndex}
      />

    </section>
  )

  return (
    <main className={classes.profile} >
      { profileHeader }
      { profileBody }
    </main>
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
    profileLoaded: state.profile.profileLoaded,
    currentUserId: state.auth.id,
  }
}

let functions = {
  change, deletePost, restorePost, addPhoto, addPostPhoto, removeNewPostPhoto, cleanNewPostPhotos
}

export default compose(
  connect(mapStateToProps, functions)
)(Profile);