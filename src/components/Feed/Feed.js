import React, { useCallback, useEffect, useRef, useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './FeedStyles.js'
import { Paper } from '@material-ui/core'
import ProfilePost from '../ProfilePost/ProfilePost.js';
import {
  getFeedPosts, getMoreFeedPosts, cleanProfilePosts, initFeed, FEED
} from '../../redux/profile_posts_reducer';
import StickyPanel from '../Common/StickyPanel.js';
import PostSkeleton from '../Common/PostSkeleton.js';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js'
import { compose } from 'redux'
import classNames from 'classnames';
import { useIntersection } from '../../hooks/hooks.js';
import LoadMore from '../Common/LoadMore.jsx';
import Adv from '../Adv/Adv.jsx';
import EmptyListStub from '../Common/EmptyListStub';

const Feed = React.memo( props => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const posts = useSelector((state) => state.profilePosts.feed)
  const cursor = useSelector((state) => state.profilePosts.feedCursor)
  const loaded = useSelector((state) => state.profilePosts.feedLoaded)
  const [morePostsLoading, setMorePostsLoading] = useState(false)
  const [moreLoadError, setMoreLoadError] = useState(false)
  const loadMore = useRef(null)

  useEffect(() => {
    document.title = t('Feed')
    dispatch(initFeed())
    dispatch(getFeedPosts(5))
    return () => dispatch(cleanProfilePosts())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMore = useCallback( async () => {
    if(!morePostsLoading && loaded && cursor) {
      try {
        setMoreLoadError(false)
        setMorePostsLoading(true)
        await dispatch(getMoreFeedPosts(5, cursor))
        setMorePostsLoading(false)
        setMoreLoadError(false)
      } catch (e) {
        setMoreLoadError(true)
        setMorePostsLoading(false)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [morePostsLoading, loaded, cursor])

  useIntersection(loaded, handleLoadMore, loadMore)
  
  const panel = <aside className={'aside-content'}>
    <StickyPanel top={55}>
      <Adv imageSrc={'/images/rekl/111.png'} />
    </StickyPanel>
  </aside>

  if(loaded && posts && !posts.length) {
    return <section className={'content'}>
      <Paper className={classNames(classes.noFeed, 'main-content')} >
        <EmptyListStub
          imageSrc='/images/animals/squirrel.png'
          containerWidth={150}
          containerHeight={150}
          text={t('empty feed')}
        />
      </Paper>
      { panel }
    </section>
  }

  let postsList = posts && posts.map(post => {
    return (
      <ProfilePost
        key={post.id}
        onOwnWall={false}
        postData={post}
        wallWidth={500}
        embeddedPost={post.embeddedPost}
        inList={true}
        userIsAuthenticated={true}
        place={FEED}
      />
    )
  })

  let postsSkeletonsList = [0, 1, 2].map((sk) => {
    return <PostSkeleton key={sk} />
  })

  return <>
    <main className='main-content'>
      <div className={classes.feedList}>
        { loaded ? postsList : postsSkeletonsList }
      </div>
      
      <LoadMore
        ref={loadMore}
        show={!!cursor}
        showProgress={moreLoadError || morePostsLoading}
      />
    </main>
    
    { panel }
  </>
})

export default compose(
  withRedirectToLogin
)(Feed);
