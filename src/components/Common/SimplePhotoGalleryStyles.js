import { makeStyles } from "@material-ui/core/styles"

export const useStyles = makeStyles((theme) => ({
  photoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    borderRadius: props => props.imageBorderRadius,
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    background: theme.palette.common.halfTransparentPaper,
    width: 24,
    height: 24,
    cursor: 'pointer',
    borderRadius: 100,
  },
  selectPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    background: theme.palette.common.halfTransparentPaper,
    width: 35,
    height: 35,
    cursor: 'pointer',
    borderRadius: 100,
  },
  withTwoPhotos: {
    borderRadius: props => props.imageBorderRadius,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  columnGallery: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative'
  },
  rowGallery: {
    width: '100%', 
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'relative'
  },
  columnWrapper: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  }, 
  rowWrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: `100%`,
    position: 'relative'
  },
  forSinglePhotoRoot: {
    width: '100%',
    display: 'flex',
  },
  forSinglePhoto: {
    background: 'rgba(255, 255, 255, 0.12)',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'contain',
    backgroundPosition: 'center',
    position: 'relative',
    overflow: 'hidden',
    cursor: 'pointer'
  }
}));