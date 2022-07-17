import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => {

  let smallWidthQuery = `@media (max-width: 599px)`
  const mediumWidthQuery = `@media (min-width: 600px)`
  const largeWidthQuery = `@media (min-width: 861px)`

  return {
    profile: {
      width: '100%',
      position: "relative"
    },
    noPosts: {
      padding: theme.spacing(2),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    coverContainer: {
      display: 'flex'
    },
    headerRoot: {
      flexGrow: 1,
      overflow: 'hidden',
      [largeWidthQuery]: {
        marginBottom: theme.spacing(2),
      }
    },
    header: {
      [mediumWidthQuery]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'scretch',
        position: 'sticky',
        top: -102,
      },
      [smallWidthQuery]: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        top: '0px'
      },
      marginBottom: theme.spacing(2)
    },
    miniHeader: {
      [mediumWidthQuery]: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: theme.palette.grey[400]
      },
      [smallWidthQuery]: {
        display: 'none'
      },
    },
    miniHeaderPicture: {
      marginLeft: 16,
      marginRight: 16
    },
    ownProfileHeader: {
      [mediumWidthQuery]: {
        top: -48
      }
    },
    miniHeaderWrapper: {
      position: 'relative',
      // background: theme.palette.divider,
      zIndex: 1
    },
    toProfileTop: {
      position: 'absolute',
      left: 0, right: 0, bottom: 0,
      height: 60, cursor: 'pointer',
    },
    [mediumWidthQuery]: {
      miniHeaderVisible: {
        /* Когда этот класс применяется к элементу, то изменения height, opacity, background будут сделаны уже с учётом этого transition
          То есть я делал неправильно, всего лишь нужно было ОДНОВРЕМЕННО изменять стили и ставить нужный transition для перехода к этим стилям.
        */
        transition: `opacity .2s .15s,height 0s 0s,background-color .15s`,
        height: '60px',
        opacity: 1,
        // background: 'gray'
      },
      miniHeaderHidden: {
        transition: `opacity .15s 0s,height .3s 0s,background-color .15s`,
        height: '0px',
        opacity: 0,
        background: theme.palette.background.paper,
      },
      headerBodyHidden: {
        transition: `opacity .15s 0s`,
        opacity: 0,
      },
      headerBodyVisible: {
        transition: `opacity .15s .15s`,
        opacity: 1,
      },
      miniHeaderBottom: {
        height: 3,
        background: theme.palette.background.default,
      },
      miniHeaderBottomWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0, right: 0,
        display: 'flex',
        justifyContent: 'center',
      },
      miniHeaderBottomVisible: {
        transition: 'width .3s .2s',
        width: '100%'
      },
      miniHeaderBottomHidden: {
        transition: 'width .3s 0s',
        width: '0%'
      },
    },
    avatarNameAndContacts: {
      display: 'flex',
      flexGrow: 1,
      minHeight: 150,
      [smallWidthQuery]: {
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'auto'
      },
    },

    profileInfoMobile: {
      marginBottom: theme.spacing(2)
    },
    noPostsStub: {
      textAlign: 'center',
      padding: theme.spacing(2),
    },
    avatarSection: {
      position: 'relative',
      marginLeft: 0,
      marginRight: 32,
      // width: 150,
      '@media (min-width: 861px)': {
        // marginLeft: 16,
        // marginRight: 16,
        // width: 182,
        // minHeight: 150,
      },
      [smallWidthQuery]: {
        marginRight: 0
      },
      flexShrink: 0
    },
    avatarContainer: {
      userSelect: 'none',
      // position: 'absolute',
      // top: 0,
      '@media (min-width: 861px)': {
        // top: -26,
      },
      border: `1px solid ${theme.palette.background.default}`,
      borderRadius: 1000,
      marginTop: 0,
      marginLeft: 32,
      marginBottom: 0,
      [smallWidthQuery]: {
        flexDirection: 'column',
        alignItems: 'center',
        position: 'relative',
        marginLeft: 0
      },
      // marginRight: 32
    },
    // avatarFrame: {
    //   position: 'absolute',
    //   width: 182,
    //   height: 182,
    //   background: theme.palette.type === 'dark' ? '#424242' : 'white',
    //   borderRadius: '10em',
    //   display: 'flex',
    //   justifyContent: 'center',
    //   alignItems: 'center'
    // },
    nameAndContacts: {
      marginTop: 32,
      flexGrow: 1,
      [smallWidthQuery]: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 0
      },
      // [largeWidthQuery]: {
      //   display: 'flex',
      //   flexDirection: 'column',
      //   alignItems: 'center'
      // }
    },
    name: {
      maxWidth: 300,
      display: 'flex',
      flexWrap: 'wrap',
      [smallWidthQuery]: {
        marginTop: 8,
      },
      fontSize: '1.5625rem',
      fontWeight: 500
    },
    contacts: {
      display: 'flex',
      // flexDirection: 'column',
      alignItems: 'flex-start',
      [smallWidthQuery]: {
        display: 'flex',
        // flexDirection: 'row',
        // alignItems: 'center',
        marginBottom: theme.spacing(1),
        flexWrap: 'wrap'
      },
    },
    contactsAvatars: {
      [smallWidthQuery]: {
        
      },
      position: 'relative',
      zIndex: 0,
      marginLeft: 8
    },
    avatarAndName: {
      textAlign: 'center',
      padding: theme.spacing(2),
    },
    skeletonBackground: {
      borderRadius: '10em',
      background: theme.palette.type === 'dark' ? '#424242' : 'white',
    },
    cover: {
      position: 'relative',
      flexGrow: 1,
      background: theme.palette.divider,
      backgroundSize: "cover",
      backgroundRepeat: 'no-repeat',
      paddingBottom: '33%',
      overflow: 'visible',
    },
    profileNavigation: {
      width: 310,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: "sticky",
    },
    profileBody: {
      width: '100%',
      padding: '0',
      '@media (min-width: 861px)': {
        display: 'flex',
      },
      alignItems: 'flex-start',
    },
    root: {
    },
    media: {
      height: theme.spacing(32)
    },
    wall: {
      flexGrow: 1,
      marginRight: 0,
      '@media (min-width: 861px)': {
        marginRight: theme.spacing(2),
      },
      width: '100%',
    },
    postsList: {
      display: 'grid',
      gridGap: theme.spacing(2),
    },
    newPostWrapper: {
      marginBottom: theme.spacing(2)
    }, 
    newPostActions: {
      margin: `0 ${theme.spacing(1)}px`
    },
    addMedia: {
      '& > *': {
        margin: theme.spacing(1) / 3,
      }
    },
    input: {
      display: 'none'
    },
    photosMobileSection: {
      padding: 0, marginBottom: 16
    },
    photosMobile: {
      display: 'flex',
      // justifyContent: 'center',
      '& > div': {
        marginRight: theme.spacing(1)
      },
      '& div:last-child': {
        marginRight: 0
      },
      padding: '0 16px 16px 16px',
    },
    photo: {
      flexShrink: 0,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      borderRadius: 4,
      overflow: 'hidden',
      cursor: 'pointer'
    },
    photoXS: {
      width: '19%',
      paddingBottom: '19%'
    },
    photoSM: {
      width: '24%',
      paddingBottom: '24%',
    },
    postFormSkeleton: {
      padding: theme.spacing(1),
      marginBottom: theme.spacing(2)
    },
    postFormSkeletonInput: {
      marginBottom: theme.spacing(1),
      display: 'flex',
      justifyContent: 'space-between'
    },
    loadMore: {
      display: 'flex', justifyContent: 'center'
    },
    editButtonRoot: {
      borderRadius: 100,
      background: theme.palette.background.paper,
      border: `2px solid ${theme.palette.divider}`,
      position: 'absolute',
      bottom: 5,
      right: 5
    },
    resize: theme.typography.body2,

    profileNotFound: {
      display: 'flex',
      flexGrow: 1,
      flexDirection: 'column',
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    },
  }
})