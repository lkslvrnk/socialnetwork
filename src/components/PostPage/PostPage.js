import { CircularProgress } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import ProfilePost from '../ProfilePost/ProfilePost';
import { getPost, PROFILE_POST } from '../../redux/profile_posts_reducer';
import { makeStyles } from "@material-ui/core/styles";
import StickyPanel from '../Common/StickyPanel';
import { Paper, Typography } from '@material-ui/core';

export const useStyles = makeStyles(theme => {
  return {
    rightPanel: {
      marginLeft: 16,
      '@media (max-width: 860px)': {
        display: 'none',
      },
    }
  }
});


function PostPage() {
  const location = useLocation()
  const splittedPathName = location.pathname.split('/')
  console.log(splittedPathName)
  const postId = splittedPathName[3]
  const post = useSelector((state) => state.profilePosts.profilePost)
  const postLoaded = useSelector((state) => state.profilePosts.profilePostLoaded)
  const currentUserId = useSelector((state) => state.auth.id)
  const dispatch = useDispatch()
  const classes = useStyles()

  useEffect(() => {
    dispatch(getPost(postId, 10))
  }, [postId])

  if(postLoaded && !post) {
    return <div>Not found</div>
  }

  return (
    <div style={{display: 'flex', justifyContent: 'center', paddingBottom: 20}}>
      <div style={{flexGrow: 1}}>
        {postLoaded
          ?  <ProfilePost
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
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 100}}>
            <CircularProgress />
          </div>
        }
      </div>
      <aside className={classes.rightPanel}>
        <StickyPanel top={55}>
          <Paper style={{padding: 16}}>
            <Typography variant='body2' color='textSecondary' style={{marginBottom: 8}}>Реклама</Typography>
            <NavLink to='/kek' ><img style={{width: '100%'}} src='/images/rekl/kd.png' /></NavLink>
          </Paper>
        </StickyPanel>
      </aside>
    </div>
  )
}

export default PostPage
