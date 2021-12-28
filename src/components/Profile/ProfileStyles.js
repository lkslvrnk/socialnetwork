import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  profile: {
    width: '100%',
    position: "relative"
  },
  noPosts: {
    padding: 16,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  coverContainer: {
    display: 'flex'
  },
  headerRoot: {
    flexGrow: 1,
    marginBottom: 16,
    overflow: 'hidden'
  },
  header: {
    position: 'relative',
    height: 180,
    display: 'flex',
    padding: 16
  },
  buttonsSection: {
    flexGrow: 1,
    alignSelf: 'end',
    display: 'flex',
    alignItems: 'end', 
    flexDirection: 'column',
    marginLeft: 'auto',
    '& > div': {
      marginTop: 8
    },
    '& div:first-child': {
      marginTop: 0
    }
  },
  buttonsSectionMobile: {
    padding: 8,
    display: 'flex',
    //flexDirection: 'column',
    // alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    '& > *': {
      marginRight: 8,
      marginBottom: 8
    },
  },
  buttonSkeleton: {
    borderRadius: 3
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
    marginRight: 16,
    width: 150,
    '@media (min-width: 861px)': {
      marginLeft: 16,
      marginRight: 32,
      width: 210,
    },
    flexShrink: 0
  },
  avatarContainer: {
    position: 'absolute',
    top: 0,
    '@media (min-width: 861px)': {
      top: -56,
    },
  },
  avatarAndName: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  avatarFrame: {
    position: 'absolute',
    width: 212,
    height: 212,
    background: theme.palette.type === 'dark' ? '#424242' : 'white',
    borderRadius: '10em',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  skeletonBackground: {
    borderRadius: '10em',
    background: theme.palette.type === 'dark' ? '#424242' : 'white',
  },
  cover: {
    position: 'relative',
    flexGrow: 1,
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
    height: '256px'
  },
  wall: {
    flexGrow: 1,
    marginRight: 0,
    '@media (min-width: 861px)': {
      marginRight: 16,
    },
    width: '100%',
    display: 'grid',
    gridGap: '16px',
  },
  newPostActions: {
    margin: '0 8px'
  },
  addMedia: {
    '& > *': {
      margin: theme.spacing(1) / 3,
    }
  },
  input: {
    display: 'none'
  },
  photosMobile: {
    display: 'flex',
    justifyContent: 'center',
    '& > div': {
      marginRight: 8
    },
    '& div:last-child': {
      marginRight: 0
    },
  },
  postFormSkeleton: {
    padding: 8
  },
  postFormSkeletonInput: {
    marginBottom: 8,
    display: 'flex',
    justifyContent: 'space-between'
  },
  loadMore: {
    display: 'flex', justifyContent: 'center'
  },
  resize: theme.typography.body2
}))