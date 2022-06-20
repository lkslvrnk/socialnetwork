import React, { useCallback, useEffect, useRef, useState } from 'react'
import Typography from '@material-ui/core/Typography'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './FeedStyles.js'
import { Button, CircularProgress, Paper } from '@material-ui/core'
import ProfilePost from '../ProfilePost/ProfilePost.js';
import { getFeedPosts, getMoreFeedPosts, cleanProfilePosts, initFeed, FEED } from '../../redux/profile_posts_reducer';
import Preloader from '../Common/Preloader/Preloader.jsx';
import StickyPanel from '../Common/StickyPanel.js';
import PostSkeleton from '../Common/PostSkeleton.js';
import ButtonWithCircularProgress from '../Common/ButtonWithCircularProgress.jsx';
import { NavLink, Redirect } from 'react-router-dom'
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js'
import { compose } from 'redux'
import EmptyListStub from '../Common/EmptyListStub'

const Feed = React.memo( props => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const posts = useSelector((state) => state.profilePosts.feed)
  const cursor = useSelector((state) => state.profilePosts.feedCursor)
  const loaded = useSelector((state) => state.profilePosts.feedLoaded)
  const [morePostsLoading, setMorePostsLoading] = useState(false)
  const loadMore = useRef(null)

  useEffect(() => {
    document.title = t('Feed')
    dispatch(initFeed())
    dispatch(getFeedPosts(5))
    return () => dispatch(cleanProfilePosts())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if(loaded) {
      var options = {root: null, rootMargin: '0px', threshold: 0.1}
      var callback = function(entries, observer) {
        entries.forEach((entry) => {
          if(entry.target.id === 'load-more-feed' && entry.isIntersecting) {
            handleLoadMoreRef.current()
          }
        })
      };
      var observer = new IntersectionObserver(callback, options)
      let loadMoreDiv = loadMore.current
      if(loadMoreDiv) observer.observe(loadMoreDiv);
      return () => observer.disconnect()
    }
  }, [loaded]);

  const handleLoadMore = useCallback( async () => {
    if(!morePostsLoading && loaded && cursor) {
      setMorePostsLoading(true)
      await dispatch(getMoreFeedPosts(5, cursor))
      setMorePostsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morePostsLoading, loaded, cursor])

  const handleLoadMoreRef = useRef(handleLoadMore)

  useEffect(() => {
    handleLoadMoreRef.current = handleLoadMore
  }, [cursor])
  
  const panel = <aside className={classes.feedRightPanel}>
    <StickyPanel top={55}>
      <Paper style={{padding: 16}}>
        <Typography variant='body2' color='textSecondary' style={{marginBottom: 8}}>Реклама</Typography>
        <NavLink to='/kek' ><img style={{width: '100%'}} src='/images/rekl/111.png' /></NavLink>
      </Paper>
    </StickyPanel>
  </aside>

  if(loaded && posts && !posts.length) {
    return <section className={classes.root}>
      <Paper className={classes.noPosts} >
        <EmptyListStub
          imageSrc='/images/animals/squirrel.png'
          containerWidth={150}
          containerHeight={150}
        />
        <Typography variant='h6' >
          {t('empty feed')}
        </Typography>
      </Paper>
      { panel }
    </section>
  }

  let postsList = posts && posts.map(post => {
    return (
      <ProfilePost
        onOwnWall={false}
        key={post.id}
        postData={post}
        wallWidth={500}
        embeddedPost={post.embeddedPost}
        inList={true}
        userIsAuthenticated={true}
        place={FEED}
      />
    )
  })

  let postsSkeletonsList = [0, 1, 2].map((sk) => <PostSkeleton key={sk} />)

  return <section className={classes.root}>
    <main className={classes.posts}>
      { loaded
        ? postsList
        : postsSkeletonsList
      }

      <div
        ref={loadMore}
        id='load-more-feed'
        style={{
          padding: cursor ? 8 : 0,
          height: cursor ? 40 : 0,
          display: 'flex',
          justifyContent: 'center',
          // marginBottom: 1
        }}
      >
        { morePostsLoading && <CircularProgress size={24} /> }
      </div>
    </main>
    { panel }
  </section>

})

export default compose(
  withRedirectToLogin
)(Feed);
