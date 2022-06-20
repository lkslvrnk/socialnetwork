import React, {useEffect, useState} from 'react'
import Avatar from "@material-ui/core/Avatar"
import PhotoGallery from '../Common/PhotoGallery.js'
import ShareIcon from "@material-ui/icons/Share"
import {NavLink} from 'react-router-dom'
import moment from 'moment'
import {baseUrl, imagesStorage} from '../../api/api'
import {useTranslation} from 'react-i18next'
import YesCancelDialog from '../Common/YesCancelDialog.js'
import {
  Paper, Typography, DialogTitle, Dialog, DialogContent, DialogActions, MenuItem, Menu, IconButton, Button,
  CardMedia, CardHeader, Divider, CardContent, Modal, Card, CardActions, ClickAwayListener, LinearProgress
} from '@material-ui/core';
import { useStyles } from './PostStyles'
import SimpleText from '../Common/SimpleText.jsx'
import CommentsSection from './CommentsSection/CommentsSection.js'
import Reactions from './Reactions.js';
import reactionsData from '../Common/ReactionsData.ts'
import MoreHorizIcon from '@material-ui/icons/MoreHoriz'
import { useDispatch, useSelector } from 'react-redux'
import { getCurrentUserPicture } from '../../redux/auth_selectors'
import PostForm from '../Profile/PostForm.js'
import PopperMenu from '../Common/PopperMenu.jsx'
import MenuListItemWithProgress from '../Common/MenuListItemWithProgress.jsx'
import TypographyLink from '../Common/TypographyLink.jsx'
import {
  restorePost,
  deletePost,
  editPostReaction,
  deletePostReaction,
  createPostReaction,
  patchPost
} from '../../redux/profile_posts_reducer'
import SimplePhotoGallery from '../Common/SimplePhotoGallery.js'
import { createSimpleGalleryPhoto } from '../../helper/helperFunctions.js'
import NavLinkAvatar from '../Common/NavLinkAvatar'
import { getFirstLetter } from '../../helper/helperFunctionsTs'

const ProfilePost = React.memo(props => {
  const {
    postData,
    onOwnWall,
    embeddedPost,
    userIsAuthenticated,
    place
 } = props

  const dispatch = useDispatch()
  const classes = useStyles();
  const { t } = useTranslation();
  // console.log('post rerender')

  const [editMode, setEditMode] = useState(false);
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null)
  const [showNewCommentField, setShowNewCommentField] = useState(postData.commentsCount > 0)
  const [shareMenuIsOpen, setShareMenuIsOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreError, setRestoreError] = useState('')
  const [menuDisabled, setMenuDisabled] = useState(false)
  const [commentingIsToggling, setCommentingIsToggling] = useState(false)
  const [postMenuAnchor, setPostMenuAnchor] = useState(null)
  const [showShareDialog, setShowShareDialog] = React.useState(false)
  const [showCancelDialog, setShowCancelDialog] = React.useState(false)

  let attachmentPhotos = []
  postData.attachments.forEach(p => {
    attachmentPhotos.push(createSimpleGalleryPhoto(
      p.id,
      postData.attachments.length === 1 ? p.versions[1] : p.versions[2],
      p.versions[0])
    )
  })

  // console.log(attachmentPhotos)
  
  const creatorLink = `/i/${postData.creator.username}`
  const picture = useSelector(getCurrentUserPicture)
  const creatorPicture = postData.creator.picture
  const postCreatorFullName = `${postData.creator.firstName} ${postData.creator.lastName}`

  const hasMedia = postData.attachments.length > 0
  
  const postCreationDate = new Date(postData.timestamp)
  const currentDate = Date.now()
  const differenceInHours = (((currentDate - postCreationDate) / 1000) /60) / 60
  const isEditable = differenceInHours < 24


  const handleRestore = () => {
    setIsRestoring(true)
    dispatch(restorePost(postData.id, place))
      .then(
        () =>  setIsRestoring(false),
        () => {
          setRestoreError(t('Failed to restore post'))
          setTimeout(() => setRestoreError(''), 3000)
          setIsRestoring(false)
        }
      )
  }

  if(postData.isDeleted) {
    return (
      <Paper style={{overflow: 'hidden'}} >
        <div style={{ padding: 16 }}>
          <span>
            <Typography
              variant='body2'
              color='textSecondary'
              component='span'
              children={`${t('Post was removed')}. `}
            >
            </Typography>
            <Typography
              style={{ cursor: 'pointer'}}
              onClick={handleRestore}
              component='span' variant='body2'
              children={t('Restore')}
            />
          </span>
        </div>
        { restoreError && <span style={{ color: 'red' }}>{ restoreError }</span>}
        { isRestoring && <LinearProgress  /> }
      </Paper>
    )
  }

  const closeShareMenu = () => {
    setShareMenuAnchor(null)
  }
  
  const close = () => {
    setShowCancelDialog(false)
    setShowShareDialog(false)
  }

  const onEditClick = () => {
    setEditMode(true)
    setPostMenuAnchor(null)
  }

  const toggleCommenting = async () => {
    setMenuDisabled(true)
    setCommentingIsToggling(true)
    if(postData.commentingIsDisabled) {
      await dispatch(patchPost(postData.id, 'comments_are_disabled', 0, place))
      setMenuDisabled(false)
      setCommentingIsToggling(false)
    } else {
      await dispatch(patchPost(postData.id, 'comments_are_disabled', 1, place))
      setMenuDisabled(false)
      setCommentingIsToggling(false)
    }
  }

  const handleDelete = () => {
    setIsDeleting(true)
    setMenuDisabled(true)
    const onEnd = () => {
      setPostMenuAnchor(null)
      setIsDeleting(false)
      setMenuDisabled(false)
    }
    dispatch(deletePost(postData.id, place)).then(onEnd, onEnd)
  }
  
  let allReactionsCount = 0;
  postData.reactionsCount.forEach(item => {
    allReactionsCount += item.count
  })

  const sortedReacionsCount = postData.reactionsCount.sort((a, b) => {
    if (a.count > b.count) return -1
    if (b.count > a.count) return 1
    return 0
  })
  const topReactionsTypes = []

  for (var i = 0; i < 3; i++) {
    if(sortedReacionsCount[i] !== undefined && sortedReacionsCount[i].count > 0) {
      topReactionsTypes.push(sortedReacionsCount[i])
    }
  }
  // console.log(topReactionsTypes)

  const onCreateReaction = reactionType => {
    return dispatch(createPostReaction(postData.id, reactionType, place))
  }

  const onEditReaction = reactionType => {
    return dispatch(editPostReaction(postData.id, postData.requesterReaction.id, reactionType, place))
  }

  const onDeleteReaction = () => {
    return dispatch(deletePostReaction(postData.id, postData.requesterReaction.id, place))
  }

  const renderShareMenu = (
    <Menu
      anchorEl={shareMenuAnchor} getContentAnchorEl={null}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      transformOrigin={{ vertical: "top", horizontal: "center" }}
      id='post-share-menu'
      keepMounted={true}
      open={Boolean(shareMenuAnchor)}
      onClick={closeShareMenu}
      onClose={closeShareMenu}
      disableScrollLock
    >
      {!onOwnWall &&
        <MenuItem onClick={() => setShowShareDialog(true)} >
          <SimpleText>{t('Share on wall')}</SimpleText>
        </MenuItem>
      }
      <MenuItem><SimpleText>{t('Share in my group')}</SimpleText></MenuItem>
      <MenuItem><SimpleText>{t('Share in dialogue')}</SimpleText></MenuItem>
    </Menu>
  );
    
  const renderShareDialog = (
    <Dialog
      onClose={() => setShowCancelDialog(true)}
      open={showShareDialog}
    >
      <DialogTitle >Lol kek</DialogTitle>

      <DialogContent>
        Кантент
      </DialogContent>
      
      <DialogActions>
        <React.Fragment>
          <Button variant="contained" onClick={() => {}} >{t('Back')}</Button>
          <Button variant="contained" onClick={() => {}} >{t('Save')}</Button>
        </React.Fragment>
      </DialogActions>
      <YesCancelDialog
        show={showCancelDialog}
        setShow={setShowCancelDialog}
        onYes={close}
        title={t('Discard changes')}
        text={t('You sure you want to discard changes?')}
      />
    </Dialog>
  )

  let renderEmbedded = null

  if(embeddedPost) {
    const photos = []
    embeddedPost.photos.map(p => photos.push({img: p}))

    renderEmbedded = (
      <CardMedia className={classes.embeddedPostMedia}>
        <CardHeader
          title={
            <Typography
              component={NavLink} to={creatorLink}
              children={embeddedPost.creatorName}
            />
          }
          subheader={moment(embeddedPost.timestamp).format("DD MMMM HH:mm")}
          avatar={
            <Avatar
              component={NavLink} to={creatorLink}
              aria-label="recipe" 
              className={classes.avatar}
              src={embeddedPost.creatorAvatar}
            ></Avatar>
          }
        />
        <Divider />
        { embeddedPost.text &&
          <CardContent>{ embeddedPost.text }</CardContent>
        }
        <CardMedia>
          <PhotoGallery
            passedImages={photos}
            editMode={false}
            spacing={1}
          />
        </CardMedia>
  
      </CardMedia>
    )
  }

  const media = (
    hasMedia && !editMode &&
    <CardMedia >
      <div style={{padding: '0 8px', marginBottom: 8}} >
        <SimplePhotoGallery
          passedImages={attachmentPhotos}
          spacing={1}
          imageBorderRadius={2}
        />
      </div>
    </CardMedia>
  )

  const handleClickAwayMenu = () => {
    if(postMenuAnchor) {
      setPostMenuAnchor(null)
    }
  }

  function handlePostMenuButtonClick(e) {
    if(!postMenuAnchor) {
      setPostMenuAnchor(e.currentTarget)
    } else {
      setPostMenuAnchor(null)
    }
  }

  const postMenu = (
    <ClickAwayListener onClickAway={handleClickAwayMenu} >
      <div>
        <IconButton
          size='small'
          onClick={ handlePostMenuButtonClick }
        >
          <MoreHorizIcon color='action' />
        </IconButton>

        <PopperMenu open={!!postMenuAnchor} anchorEl={postMenuAnchor} dense>
          {onOwnWall ?
            <div>
            { isEditable &&
              <MenuItem disabled={menuDisabled} onClick={onEditClick} >
                {t('Edit')}
              </MenuItem>
              }
              <MenuListItemWithProgress
                children={t('Delete')} onClick={handleDelete}
                disabled={menuDisabled} enableProgress={isDeleting}
                progressSize={32}
                
              />
              <MenuListItemWithProgress
                disabled={menuDisabled}
                enableProgress={commentingIsToggling}
                progressSize={32}
                onClick={toggleCommenting}
              >
                {t(postData.commentingIsDisabled
                  ? 'Enable comments' : 'Disable comments')}
              </MenuListItemWithProgress>
            </div>
            :
            
              <MenuItem disabled={menuDisabled} >
                {t('Complain')}
              </MenuItem>
            
          }
        </PopperMenu>
      </div>
    </ClickAwayListener>
  )

  const shareAction = (
    <div>
      <IconButton disabled onClick={() => setShareMenuIsOpen(true)} >
        <ShareIcon />
      </IconButton>

      <Modal
        style={{display:'flex',alignItems:'center',justifyContent:'center'}}
        open={shareMenuIsOpen}
        onClose={() => setShareMenuIsOpen(false)}
        aria-labelledby="simple-modal-title"
        aria-describedby="simple-modal-description"
      >
        <Paper className={classes.shareMenu} >
          <MenuItem value={10}>Поделиться</MenuItem>
          <MenuItem value={20}>Поделиться</MenuItem>
          <MenuItem value={30}>Поделиться</MenuItem>
        </Paper>
      </Modal>
    </div>
  )

  const commentsAndReactionsInfo = (
    (allReactionsCount > 0 || postData.commentsCount > 0) &&
    <>
    <div className={classes.postDivider} ><Divider /></div>
    <div className={classes.postReactionsAndCommentsInfo} >
      <div className={classes.postReactionsInfo} >
        {topReactionsTypes.map((reaction) => {
          const reactionImageSrc = reactionsData.find(element => {
            return element.type === reaction.type
          }).src

          return (
            <div
              key={ reaction.type }
              className={classes.mostPopularReactionsItem}
              style={{ backgroundImage: `url(${reactionImageSrc})`}}
            />
          )
        })}
        { allReactionsCount > 0 &&
          <div style={{marginLeft: 8}}><SimpleText>{ allReactionsCount }</SimpleText></div>
        }
      </div>
      { postData.commentsCount > 0 &&
        <SimpleText >{`${t('Comments')}: ${postData.commentsCount}`}</SimpleText>
      }
    </div>
    <div className={classes.postDivider} ><Divider /></div>
    </>
  )

  const postLink = `/i/posts/${postData.id}`

  return (
    <Card
      className={classes.card}
    >
      <CardHeader
        className={classes.postHeader}
        action={ !editMode && userIsAuthenticated && postMenu }
        title={
          <TypographyLink
          to={creatorLink}
          children={postCreatorFullName}
          style={{wordBreak: 'break-all'}}
        />
        }
        subheader={
          <TypographyLink
            to={postLink}
            children={moment(postData.timestamp).format("DD MMMM HH:mm")}
            style={{wordBreak: 'break-all'}}
            color='textSecondary'
            variant='body2'
          />
        }
        avatar={
          // <div className={classes.avatarBorder}>
            <NavLinkAvatar
              width={50}
              to={creatorLink}
              picture={creatorPicture}
              name={postData.creator.firstName + ' ' + postData.creator.lastName}
            />
          // </div>
        }
      />
      { postData.text && !editMode &&
        <CardContent className={classes.contentContainer} >
          <SimpleText>{postData.text}</SimpleText>
        </CardContent>
      }
      { editMode &&
        <>
          <PostForm
            editMode={editMode}
            setEditMode={setEditMode}
            text={postData.text}
            currentAttachments={attachmentPhotos}
            commentingIsDisabled={postData.commentingIsDisabled}
            isPublic={postData.isPublic}
            onEditFinish={ () => setEditMode(false)}
            editingPostId={postData.id}
          />
          <Divider />
        </>
      }
      { media }
      { renderEmbedded }
      { commentsAndReactionsInfo }
      { userIsAuthenticated &&
        <CardActions className={classes.postActions} >
          <Reactions
            animate
            onCreateReaction={onCreateReaction}
            onEditReaction={onEditReaction}
            onDeleteReaction={onDeleteReaction}
            currentUserReaction={postData.requesterReaction}
          />
          { shareAction }
        </CardActions>
      }
      <>
        <CommentsSection
          key={ postData.id }
          postId={postData.id}
          postCreatorId={postData.creator.id}
          showNewCommentField={showNewCommentField}
          commentsCount={postData.commentsCount}
          commentingIsDisabled={postData.commentingIsDisabled}
          userIsAuthenticated={userIsAuthenticated}
          onOwnWall={onOwnWall}
          place={place}
        />

      </>
              
      { renderShareMenu }
      { renderShareDialog }

    </Card>
  )
})

export default ProfilePost