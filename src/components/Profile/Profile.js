import React, { useState, useEffect, useRef, useCallback } from 'react';
import RightProfilePanel from './RightProfilePanel/RightProfilePanel.js'
import { connect, useDispatch, useSelector } from 'react-redux'
import { compose } from 'redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './ProfileStyles';
// import 'emoji-mart/css/emoji-mart.css'
import { change } from 'redux-form'
import { cleanProfile, getUserById } from '../../redux/profile_reducer'
import {
  getPosts, createPost, addPostPhoto,
  removeNewPostPhoto, cleanNewPostPhotos, getMorePosts,
  restorePost, deletePost, PROFILE_POSTS
} from '../../redux/profile_posts_reducer'
import { addPhoto } from '../../redux/photos_reducer'
import { Button, IconButton, Paper } from '@material-ui/core';
import {
  useImageViewer, useIntersection, usePrevious
} from '../../hooks/hooks.js';
import PostForm from './PostForm/PostForm.js';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import ProfileAvatar from './ProfileAvatar/ProfileAvatar';
import Typography from "@material-ui/core/Typography";
import StickyPanel from '../Common/StickyPanel.js';
import { Divider } from '@material-ui/core';
import { useLocation, useParams } from 'react-router-dom';
import EditIcon from '@material-ui/icons/Edit';
import Skeleton from '@material-ui/lab/Skeleton';
import { getCurrentUserUsername } from '../../redux/auth_selectors';
import ProfilePost from '../ProfilePost/ProfilePost.js';
import PostSkeleton from '../Common/PostSkeleton.js';
import Communication from './Communication/Communication.js';
import MobilePhotosSection from './MobilePhotosSection/MobilePhotosSection.js';
import 'react-photo-view/dist/index.css';
import TypographyLink from '../Common/TypographyLink.jsx';
import Info from './Info/Info.js';
import CoverEditor from './CoverEditor/CoverEditor.js';
import EmptyListStub from '../Common/EmptyListStub';
import CustomImageViewer from '../Common/CustomImageViewer.jsx';
import LoadMore from '../Common/LoadMore.jsx';
import cn from 'classnames';
import CustomAvatarGroup from '../Common/CustomAvatarGroup.jsx';

const Profile = React.memo(props => {
  const {
    postsLoaded, posts, currentUserId, profile,
    profileLoaded, postsCursor, postsCount
  } = props
  const mobile = useMediaQuery('(max-width: 860px)')

  const isAuthenticated = !!currentUserId
  const [showAvatarEditor, setShowAvatarEditor] = useState(false)
  let location = useLocation();
  const params = useParams()
  const dispatch = useDispatch()
  const classes = useStyles()
  const { t } = useTranslation()
  let wall = React.useRef(null)
  const [morePostsLoading, setMorePostsLoading] = useState(false)
  const [morePostsLoadingError, setMorePostsLoadingError] = useState(false)
  const loadMore = useRef(null)

  const handleLoadMorePosts = useCallback(async () => {
    if (!morePostsLoading && postsLoaded && !!profile && postsCursor) {
      try {
        setMorePostsLoadingError(false)
        setMorePostsLoading(true)
        await dispatch(getMorePosts(profile.id, 5, postsCursor, 'DESC', 2, 'DESC'))
      } catch (e) {
        setMorePostsLoadingError(true)
      } finally {
        setMorePostsLoading(false)
      }
    }
  }, [postsLoaded, postsCursor, morePostsLoading, profile, dispatch])

  useIntersection(postsLoaded, handleLoadMorePosts, loadMore)
  const usernameFromUrl = params.username

  // useEffect(() => {
  //   return () => {
  //     console.log('unmount profile')
  //   }
  // }, [])

  useEffect(() => {
    if (!profile) {
      document.title = (location.state && location.state.firstName && location.state.lastName)
        ? `${location.state.firstName} ${location.state.lastName}`
        : 'Профиль пользователя'
    } else {
      document.title = ownerFullName
    }
    document.documentElement.scrollTop = 0
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromUrl])

  useEffect(() => {
    window.scrollTo(0, 0)
    return () => {
      dispatch(cleanProfile())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    (function () {
      if (!profile || (profile && profile.username !== usernameFromUrl)) {
        if (profile) {
          dispatch(cleanProfile())
        }
        dispatch(getUserById(usernameFromUrl))
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usernameFromUrl])

  useEffect(() => {
    if ((!postsLoaded || (!!profile && profile.id !== prevProfileId))
      && (!!profile)
    ) {
      dispatch(getPosts(profile.id, 5, null, 'DESC', 2, 'DESC'))
    }
    setShowAvatarEditor(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile])

  const headerRef = useRef(null)
  const miniHeader = useRef(null)
  const [showMiniHeader, setShowMiniHeader] = useState(false)

  const prevHeaderState = useRef('visible')

  useEffect(() => {
    prevHeaderState.current = headerRef.current
      && headerRef.current.getBoundingClientRect().bottom <= 105
        ? 'visible' : 'invisible'
  }, [mobile])

  useEffect(() => {
    const scrollHandler = () => {
      if (headerRef.current) {
        if (headerRef.current.getBoundingClientRect().bottom <= 105) {
          if (prevHeaderState.current === 'visible') {
            setShowMiniHeader(true)
          }
          prevHeaderState.current = 'invisible'
        } else {
          if (prevHeaderState.current === 'invisible') {
            setShowMiniHeader(false)
          }
          prevHeaderState.current = 'visible'
        }
      }
    }
    scrollHandler()
    document.addEventListener('scroll', scrollHandler)
    return () => {
      document.removeEventListener('scroll', scrollHandler)
    }
  }, [])

  const prevProfileId = usePrevious(profile ? profile.id : undefined)
  const currentUserUsername = useSelector(getCurrentUserUsername)

  const [index, showImageViewer, openImageViewer, closeImageViewer] = useImageViewer()

  if (profileLoaded && !profile) {
    return (
      <div className={classes.profileNotFound}>
        <span role='img' aria-label='no-subscribers' className={'stub-image'}>
          🐷
        </span>
        <Typography variant='h4' >{t('Profile not found')}</Typography>
      </div>
    )
  }

  const reversedPictures = profile ? [...profile.pictures].reverse() : []
  const preparedSmallPictures = []
  const preparedLargePictures = []

  reversedPictures.forEach((picture) => {
    const id = picture.id
    const smallSrc = picture.versions.small.src
    const originalSrc = picture.versions.original.src
    preparedSmallPictures.push({ id, src: smallSrc })
    preparedLargePictures.push({ id, src: originalSrc })
  })

  const forImageViewer = []
  preparedLargePictures.forEach(p => forImageViewer.push(p.src))

  const onAvatarClick = () => {
    openImageViewer(0)
  }

  const ownerFullName = !!profile && `${profile.firstName} ${profile.lastName}`
  const coverStubSrc = 'https://s1.1zoom.ru/big0/596/Evening_Forests_Mountains_Firewatch_Campo_Santo_549147_1280x720.jpg'
  const isOwnProfile = profile
    ? profile.username === currentUserUsername
    : false
  const onOwnWall = currentUserId === (profile ? profile.id : '-1')

  let postsList = posts.map(post => {
    return (
      <ProfilePost
        onOwnWall={onOwnWall}
        key={post.id}
        postData={post}
        wallWidth={500}
        embeddedPost={post.embeddedPost}
        inList={true}
        userIsAuthenticated={currentUserId}
        place={PROFILE_POSTS}
      />
    )
  })

  let postsSkeletonsList = [0, 1, 2].map((e) => <PostSkeleton key={e} />)

  const onPost = async (text, attachments, isPublic, disableComments) => {
    return dispatch(createPost(text, attachments, isPublic, disableComments, 0, null))
  }

  let editProfileButton = false &&
    <div className={classes.buttonsSection}>
      {profileLoaded
        ?
        <Button
          disabled
          variant='contained'
          startIcon={<EditIcon />}
          children={t('Edit profile')}
        />
        :
        <Skeleton
          className={classes.buttonSkeleton}
          variant='rect'
          width={150}
          height={36}
        />
      }
    </div>

  let renderProfilePicture = (
    <ProfileAvatar
      onClick={onAvatarClick}
      isOwnProfile={onOwnWall}
      currentUserId={currentUserId}
      userFirstName={profile ? profile.firstName : 'Unknown'}
      userLastName={profile ? profile.lastName : 'Unknown'}
      size={150}
      showEditButton={onOwnWall}
    />
  )

  let miniProfilePicture = (
    <ProfileAvatar
      onClick={onAvatarClick}
      isOwnProfile={onOwnWall}
      currentUserId={currentUserId}
      userFirstName={profile ? profile.firstName : 'Unknown'}
      userLastName={profile ? profile.lastName : 'Unknown'}
      size={45}
      showEditButton={false}
    />
  )

  const avatar = renderProfilePicture

  const avatarSkeleton = (
    <div className={classes.sleletonBackground} >
      <Skeleton variant='circle' width={150} height={150} />
    </div>
  )

  const cover = (
    <div
      className={classes.cover}
      style={{
        backgroundImage: profileLoaded
          ? `url(${profile.cover ? profile.cover.versions.cropped_original : coverStubSrc})`
          : 'none',
      }}
    >
      {isOwnProfile && <Paper className={classes.editButtonRoot} >
        <IconButton
          size='small'
          onClick={() => setShowAvatarEditor(true)}
          children={<EditIcon />}
        />
      </Paper>
      }
      {!profileLoaded &&
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

  const renderMiniHeader = (
    <div className={classes.miniHeaderWrapper} >
      <div
        ref={miniHeader}
        className={cn(
          classes.miniHeader,
          showMiniHeader ? classes.miniHeaderVisible : classes.miniHeaderHidden
        )}
      >
        <div className={classes.miniHeaderPicture}>
          {miniProfilePicture}
        </div>

        {!!profile &&
          <Typography variant='h6'>
            {profile.firstName}&nbsp;{profile.lastName}
          </Typography>
        }
        <div className={classes.miniHeaderBottomWrapper}>
          <div
            id='mini-header-bottom'
            className={cn(
              classes.miniHeaderBottom,
              showMiniHeader
                ? classes.miniHeaderBottomVisible
                : classes.miniHeaderBottomHidden,
            )}
          />
        </div>

      </div>
      {showMiniHeader &&
        <div
          className={classes.toProfileTop}
          onClick={() => document.documentElement.scrollTo({
            top: 0,
            behavior: "smooth"
          })}
        />
      }
    </div>
  )

  const contacts = []
  if (profile) {
    const length = profile.acceptedConnections.length >= 5
      ? 5
      : profile.acceptedConnections.length

    for (let index = 0; index < length; index++) {
      const conn = profile.acceptedConnections[index]
      const contact = profile.id === conn.target.id
        ? conn.initiator : conn.target

      contacts.push({
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        picture: { src: contact.picture },
        username: contact.username
      })
    }
  }

  const renderContactsAvatars = profileLoaded && profile.allAcceptedConnections > 0 && (
    <div className={classes.contacts}>
      <TypographyLink
        to={`/i/${profile.username}/contacts`}
        variant='subtitle1'
      >
        {t('Contacts')}:&nbsp;{profile.allAcceptedConnections}
      </TypographyLink>

      <div className={classes.contactsAvatars} >
        <CustomAvatarGroup
          usersData={contacts}
          width={30}
          total={profile.acceptedConnections.length}
        />
      </div>
    </div>
  )

  const mainInfoAndCommunication = (
    <Paper
      ref={headerRef}
      className={cn(classes.header, isOwnProfile ? classes.ownProfileHeader : '')}
      style={{ zIndex: showMiniHeader ? 1 : 0 }}
    >
      <div
        className={cn(
          classes.avatarNameAndContacts,
          showMiniHeader ? classes.headerBodyHidden : classes.headerBodyVisible
        )}
      >
        <div className={classes.avatarSection}>
          <div className={classes.avatarContainer} >
            {profileLoaded ? avatar : avatarSkeleton}
          </div>
        </div>

        <div className={classes.nameAndContacts}>
          <div className={classes.name}>
            {profileLoaded
              ? <span>
                {profile.firstName}&nbsp;{profile.lastName}
              </span>
              : <Skeleton variant='text' width={250} height={40} />
            }
          </div>

          {profileLoaded
            ?
            renderContactsAvatars
            :
            <>
              <Skeleton variant='text' width={150} height={20} />
              <Skeleton variant='text' width={150} height={20} />
            </>
          }
        </div>
      </div>

      <div
        className={showMiniHeader
          ? classes.headerBodyHidden : classes.headerBodyVisible
        }
      >
        {editProfileButton}
        {communication}
      </div>

      {renderMiniHeader}
    </Paper>
  )

  const profileHeader = (
    <Paper
      component='section'
      className={classes.headerRoot}
    >
      {cover}
    </Paper>
  )

  const panelSkeleton = (
    <div style={{ width: 300 }}>
      {[1, 2, 3, 4].map(section => {
        return (
          <Paper key={section} style={{ padding: 16, marginBottom: 16 }}>
            <Skeleton variant='text' width={150} />

            {[1, 2, 3, 4].map(item => (
              <div key={item} style={{ display: 'flex', marginTop: 8 }}>
                <Skeleton
                  style={{ marginRight: 16 }}
                  variant='circle'
                  height={30}
                  width={30}
                />
                <Skeleton variant='text' height={20} width={150} />
              </div>
            ))}
          </Paper>
        )
      })}
    </div>
  )

  const infoSection = <Info profile={profile} />

  const profileBody = (
    <section className={classes.profileBody} >
      {mobile && mainInfoAndCommunication}

      {mobile &&
        <section style={{ marginBottom: 16 }}>
          {infoSection}
        </section>
      }
      {mobile && preparedSmallPictures.length > 0 &&
        <MobilePhotosSection
          handlePhotoClick={openImageViewer}
          pictures={preparedSmallPictures}
          profileLoaded={profileLoaded}
        />
      }
      <div ref={wall} className={classes.wall}  >
        {!mobile &&
          mainInfoAndCommunication
        }
        {isOwnProfile && profileLoaded &&
          <Paper className={classes.newPostWrapper}>
            <PostForm onSubmit={onPost} />
          </Paper>
        }
        {!profileLoaded &&
          <Paper className={classes.postFormSkeleton} >
            <div className={classes.postFormSkeletonInput} >
              <Skeleton variant='text' width={200} />
              <Skeleton variant='circle' width={20} height={20} />
            </div>
            <Divider />
            <Skeleton
              variant='rect' width={150} height={40}
              style={{ borderRadius: 3, marginLeft: 'auto', marginTop: 24 }}
            />
          </Paper>
        }

        <section className={classes.postsList}>
          {!profile || !postsLoaded
            ? postsSkeletonsList
            : postsList
          }
        </section>

        {!!profile && postsCount === 0 &&
          <Paper className={classes.noPosts} >
            <EmptyListStub
              imageSrc='/images/animals/elephant.png'
              containerWidth={150}
              containerHeight={150}
              text={t('No posts yet')}
            />
          </Paper>
        }
        <LoadMore
          ref={loadMore}
          show={!!postsCursor}
          showProgress={morePostsLoading || morePostsLoadingError}
        />
      </div>

      {!mobile &&
        <StickyPanel top={55} >
          {profileLoaded ?
            <RightProfilePanel
              onPhotoClick={openImageViewer}
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
      <CustomImageViewer
        show={showImageViewer}
        src={forImageViewer}
        currentIndex={index}
        onClose={closeImageViewer}
      />
    </section>
  )

  return (
    <main className={cn(classes.profile)} >
      {profileHeader}
      {profileBody}
    </main>
  )
})

let mapStateToProps = state => {
  return {
    newPostPhotos: state.profile.newPostPhotos,
    postsLoaded: state.profilePosts.profilePostsAreLoaded,
    posts: state.profilePosts.profilePosts,
    postsCursor: state.profilePosts.profilePostsCursor,
    postsCount: state.profilePosts.profileAllPostsCount,
    profile: state.profile.profile,
    profileLoaded: state.profile.profileLoaded,
    currentUserId: state.auth.id,
  }
}

let functions = {
  change, deletePost, restorePost, addPhoto, addPostPhoto,
  removeNewPostPhoto, cleanNewPostPhotos
}

export default compose(
  connect(mapStateToProps, functions)
)(Profile);