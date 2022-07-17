import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ProfilePost from '../ProfilePost/ProfilePost';
import { getPost, PROFILE_POST } from '../../redux/profile_posts_reducer';
import StickyPanel from '../Common/StickyPanel';
import { useStyles } from './PostPageStyles';
import { useTranslation } from 'react-i18next';
import Adv from '../Adv/Adv';

function PostPage() {
  const location = useLocation()
  const splittedPathName = location.pathname.split('/')
  const postId = splittedPathName[3]
  const post = useSelector((state) => state.profilePosts.profilePost)
  const postLoaded = useSelector((state) => state.profilePosts.profilePostLoaded)
  const currentUserId = useSelector((state) => state.auth.id)
  const dispatch = useDispatch()
  const classes = useStyles()
  const {t} = useTranslation()

  useEffect(() => {
    dispatch(getPost(postId, 10))
  }, [postId, dispatch])

  if(postLoaded && !post) {
    return <div>{t('Post not found')}</div>
  }

  return (
    <div className={'content'} >
      <div className={'main-content'} >
        {postLoaded
          ? <ProfilePost
            onOwnWall={post.creator.id === currentUserId}
            key={post.id}
            postData={post}
            wallWidth={500}
            embeddedPost={post.embeddedPost}
            inList={false}
            userIsAuthenticated={currentUserId}
            place={PROFILE_POST}
          />
          :
          <div className={classes.loader} >
            <CircularProgress />
          </div>
        }
      </div>
      
      <aside className={'aside-content'}>
        <StickyPanel top={55}>
          <Adv imageSrc={'/images/rekl/kd.png'} />
        </StickyPanel>
      </aside>
    </div>
  )
}

export default PostPage
