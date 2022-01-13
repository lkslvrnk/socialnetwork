import React, {useState, useEffect, useRef} from 'react'
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone'
import { PhotoSlider } from 'react-photo-view'
import { useStyles } from './SimplePhotoGalleryStyles'

const SimplePhotoGallery = React.memo((props) => {
  const {imageBorderRadius, editMode, passedImages, spacing, setAttachments, centering = true} = props
  const classes = useStyles()
  const gallery = useRef(null)
  
  const preparedPhotos = []
  passedImages.forEach((image, index) => {
    preparedPhotos.push(
      createPhotoObject(index, image.id, image.large.src, image.preview.src, image.preview.width, image.preview.height)
    )
  })

  const [galleryLoaded, setGalleryLoaded] = useState(false)
  useEffect(() => {
    setGalleryLoaded(true)
  }, [])

  const preparedLargePictures = []
  preparedPhotos.forEach((photo) => {
    preparedLargePictures.push({src: photo.largeSrc})
  })

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewerIsOpen, setViewerIsOpen] = useState(false);

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setViewerIsOpen(true);
  }

  const closeLightbox = () => {
    setCurrentImageIndex(0);
    setViewerIsOpen(false);
  };

  function createPhotoObject(index, id, largeSrc, previewSrc, previewWidth, previewHeight) {
    const photo = {
      id: id,
      index: index,
      largeSrc: largeSrc,
      previewSrc: previewSrc,
      defaultWidth: previewWidth,
      width: previewWidth,
      defaultHeight: previewHeight,
      height: previewHeight,
      heightPercents: 0,
      widthPercents: 0,
    }

    photo.reduceRatioTo = reduceRatioTo.bind(photo)
    photo.scaleToHeight = scaleToHeight.bind(photo)
    photo.scaleToWidth = scaleToWidth.bind(photo)
    photo.setWidthRatio = setWidthRatio.bind(photo)
    photo.setHeightRatio = setHeightRatio.bind(photo)

    return photo
  }

  const createPhotosWrapper = () => {
    const wrapper = {
      width: 0,
      height: 0,
      widthPercents: 0,
      heightPercents: 0,
    }
    wrapper.scaleToHeight = scaleToHeight.bind(wrapper)
    wrapper.scaleToWidth = scaleToWidth.bind(wrapper)
    wrapper.reduceRatioTo = reduceRatioTo.bind(wrapper)
    wrapper.scalePhotosToHeight = scalePhotosToHeight.bind(wrapper)
    wrapper.scalePhotosToWidth = scalePhotosToWidth.bind(wrapper)
    wrapper.setPhotosHeightPercents = setPhotosHeightPercents.bind(wrapper)
    wrapper.setPhotosWidthPercents = setPhotosWidthPercents.bind(wrapper)
    wrapper.reduceWidth = reduceWidth.bind(wrapper)

    return wrapper
  }

  const createColumnWrapper = (ratio, photos, blocks) => {
    const photosWrapper = createPhotosWrapper()
    const biggestWidth = getBiggestWidth(photos)
    photos.forEach(photo => photo.scaleToWidth(biggestWidth))
    photos.forEach(photo => photosWrapper.height += photo.height)
    photosWrapper.width = biggestWidth
    photosWrapper.photos = photos
    photosWrapper.blocks = blocks

    return photosWrapper
  }

  const createRowWrapper = (photos) => {
    const photosWrapper = createPhotosWrapper()
    const biggestHeight = getBiggestHeight(photos)
    photos.forEach(photo => photo.scaleToHeight(biggestHeight))
    photos.forEach(photo => photosWrapper.width += photo.width)
    photosWrapper.height = biggestHeight
    photosWrapper.photos = photos
    return photosWrapper
  }

  const onDeletePhoto = (photoId) => {
    setAttachments(prev => {
      return prev.filter(image => image.id !== photoId)
    })
  }

  let forOnePhoto = (photo) => {
    let galleryWidth = gallery.current.getBoundingClientRect().width
    let galleryHeight = galleryWidth
    let photoHeight = photo.defaultHeight
    let photoWidth = photo.defaultWidth

    let heightPercents = 0
    let widthPercents = 0
    if(photoWidth > photoHeight) {
      if(photoWidth >= galleryWidth) {
        widthPercents = 100
        heightPercents = (photoHeight / photoWidth) * 100
      } else {
        widthPercents = (photoWidth / galleryWidth) * 100
        heightPercents = (photoHeight / galleryWidth) * 100
      }
    } else if(photoWidth < photoHeight) {
      if(photoHeight >= galleryWidth) {
        heightPercents = 100
        widthPercents = (photoWidth / photoHeight) * 100
      } else {
        heightPercents = (photoHeight / galleryWidth) * 100
        widthPercents = (photoWidth / galleryWidth) * 100
      }
    } else { // equal width and height
      if(photoWidth >= galleryWidth) {
        widthPercents = 100
        heightPercents = 100
      } else {
        heightPercents = (photoHeight / galleryWidth) * 100
        widthPercents = (photoWidth / galleryWidth) * 100
      }
    }

    return (
      <div className={classes.forSinglePhotoRoot} style={{justifyContent: centering ? 'center' : 'flex-start'}}>
        <div
          className={classes.forSinglePhoto}
          style={{
            backgroundImage: `url(${photo.previewSrc})`,
            width: `${widthPercents}%`,
            paddingTop: `${heightPercents}%`,
            borderRadius: imageBorderRadius,
          }}
        >
          <div
            onClick={() => openLightbox(0)}
            style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,}}
          />
          { editMode &&
            <div
              className={classes.removePhoto}
              onClick={() => onDeletePhoto(photo.id)}
            >
              <CancelTwoToneIcon fontSize='medium' />
            </div>
          }
        </div>
      </div>
    )
  }

  const renderVertically = (columns) => {
    let wrappers = []
    columns.forEach(column => {
      wrappers.push(createColumnWrapper(1.5, column))
    })
    let allWidth = 0
    const biggestHeight = getBiggestHeight(wrappers)
    wrappers.forEach(wrapper => {
      wrapper.scalePhotosToHeight(biggestHeight)
      allWidth += wrapper.width
    })

    const allSpacings = spacing * (wrappers.length - 1)
    const kek = allWidth * (allSpacings / 100)
    wrappers.forEach(wrapper => {
      let ooo = (kek / (wrappers.length))
      wrapper.reduceWidth(ooo)
      
      wrapper.widthPercents = ((wrapper.width / allWidth)) * 100
      wrapper.setPhotosHeightPercents(allWidth, spacing)
    })

    return (
      <div className={classes.rowGallery}>
        {wrappers.map(wrapper => {
          return (
            <div
              className={classes.columnWrapper}
              style={{width: `${wrapper.widthPercents}%`,}}
            >
              {wrapper.photos.map((photo, index) => {
                let wrapperLength = wrapper.photos.length
                let currentPhoto = index + 1
                let spacingHeightInWrapper = spacing * (100 / wrapper.widthPercents)
                let allSpacings = spacingHeightInWrapper * (wrapperLength - 1)
                
                return (
                  <>
                    <PhotoContainer
                      editMode={editMode}
                      imageBorderRadius={imageBorderRadius}
                      src={photo.previewSrc}
                      id={photo.id}
                      height={photo.heightPercents - (allSpacings / wrapperLength)}
                      width={100} 
                      editMode={editMode}
                      onClose={ () => onDeletePhoto(photo.id) }
                      onClick={() => openLightbox(photo.index)}
                    />
                    {currentPhoto < wrapperLength && <div style={{marginBottom: `${spacingHeightInWrapper}%`}}/>}
                  </>
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  const renderHorizontally = (columns) => {
    const wrappers = []
    columns.forEach(column => {
      wrappers.push(createRowWrapper(column))
    })
    const biggestWidth = getBiggestWidth(wrappers)
    wrappers.forEach(wrapper => wrapper.scalePhotosToWidth(biggestWidth))

    let allWidth = wrappers[0].width
    wrappers.forEach(wrapper => {
      wrapper.heightPercents = wrapper.height / allWidth * 100
      wrapper.setPhotosWidthPercents(spacing)
    })
    return (
      <div className={classes.columnGallery} >
        {wrappers.map((wrapper, index) => {
          return (
            <div
              key={index}
              className={classes.rowWrapper}
              style={{
                marginBottom: index < (wrappers.length - 1)
                  ? `${spacing}%` : null
              }}
            >
              {wrapper.photos.map((photo, index) => {
                return (
                  <PhotoContainer
                    key={photo.id}
                    editMode={editMode}
                    imageBorderRadius={imageBorderRadius}
                    src={photo.previewSrc}
                    id={photo.id}
                    height={wrapper.heightPercents}
                    width={photo.widthPercents} 
                    onClose={ () => onDeletePhoto(photo.id) }
                    onClick={() => openLightbox(photo.index)}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  let readyPhotos = null

  if(galleryLoaded) {
    const photosLength = preparedPhotos.length
  
    if(photosLength === 1) {
      readyPhotos = forOnePhoto(preparedPhotos[0])
    } else if(photosLength === 2) {
      let firstPhoto = preparedPhotos[0]
      let secondPhoto = preparedPhotos[1]
  
      let firstPhotoRatio = firstPhoto.width / firstPhoto.height
      let secondPhotoRatio = secondPhoto.width / secondPhoto.height
  
      if((firstPhotoRatio + secondPhotoRatio) > 3) {
        firstPhoto.setWidthRatio(2)
        secondPhoto.setWidthRatio(2)
        readyPhotos = renderHorizontally([[firstPhoto], [secondPhoto]])
      } else {
        let photosArr = [firstPhoto, secondPhoto]
        let biggestWidthRatio = 0
        photosArr.forEach(photo => {
          let ratio = photo.width / photo.height
          if(ratio > biggestWidthRatio) {
            biggestWidthRatio = ratio
          }
        })
        firstPhoto.setWidthRatio(biggestWidthRatio)
        secondPhoto.setWidthRatio(biggestWidthRatio)
        readyPhotos = renderVertically([[firstPhoto], [secondPhoto]])
      }
    } else if(photosLength === 3) {
      let firstPhoto = preparedPhotos[0]
      let secondPhoto = preparedPhotos[1]
      let thirdPhoto = preparedPhotos[2]
  
      let firstPhotoRatio = firstPhoto.width / firstPhoto.height
      let secondPhotoRatio = secondPhoto.width / secondPhoto.height
      let thirdPhotoRatio = thirdPhoto.width / thirdPhoto.height
      let allPhotos = [firstPhoto, secondPhoto, thirdPhoto]
  
      if(firstPhotoRatio >= 3 && secondPhotoRatio >= 3 && thirdPhotoRatio >= 3) {
        readyPhotos = renderHorizontally([[firstPhoto], [secondPhoto], [thirdPhoto]])
      } else if(firstPhotoRatio < 0.5 && secondPhotoRatio < 0.5 && thirdPhotoRatio < 0.5) {
        allPhotos.forEach(photo => {
          photo.reduceRatioTo(3)
        })
        readyPhotos = renderVertically([[firstPhoto], [secondPhoto], [thirdPhoto]])
      } else if(firstPhotoRatio <= 1.25) {
        firstPhoto.reduceRatioTo(1.5)
        allPhotos.forEach((photo, index) => {
          if(index === 0) return
          if(photo.width > photo.height) {
            photo.setWidthRatio(1)
          } else if(photo.width < photo.height) {
            photo.setHeightRatio(1.25)
          }
        })
  
        readyPhotos = renderVertically([[firstPhoto], [secondPhoto, thirdPhoto]])
      } else if(firstPhotoRatio > 1.25) {
        if(firstPhotoRatio < 1.5) {
          firstPhoto.setWidthRatio(1.5)
        }
        allPhotos.forEach((photo, index) => {
          if(index === 0) return
          photo.setWidthRatio(1.5)
        })
        readyPhotos = renderHorizontally([[firstPhoto], [secondPhoto, thirdPhoto]])
      } else {
        readyPhotos = renderHorizontally([[firstPhoto], [secondPhoto, thirdPhoto]])
      }
    } else if(photosLength === 4) {
      let firstPhoto = preparedPhotos[0]
      let secondPhoto = preparedPhotos[1]
      let thirdPhoto = preparedPhotos[2]
      let fourthPhoto = preparedPhotos[3]
  
      let otherPhotos = [secondPhoto, thirdPhoto, fourthPhoto]
      let firstPhotoRatio = firstPhoto.width / firstPhoto.height
      
      if(firstPhotoRatio <= 1.25) {
        firstPhoto.reduceRatioTo(1.5)
        otherPhotos.forEach(photo => {
          if(photo.width > photo.height) {
            photo.setWidthRatio(1)
          } else if(photo.width < photo.height) {
            photo.setHeightRatio(1.25)
          }
        })
        readyPhotos = renderVertically([[firstPhoto], otherPhotos])
      } else if(firstPhotoRatio > 1.25) {
        if(firstPhotoRatio < 1.5) {
          firstPhoto.setWidthRatio(1.5)
        }
        otherPhotos.forEach(photo => photo.setWidthRatio(1.5))
        readyPhotos = renderHorizontally([[firstPhoto], otherPhotos])
      }
    } else if (photosLength > 4 && photosLength < 9) {
      let firstPhoto = preparedPhotos[0]
      let secondPhoto = preparedPhotos[1]
      let otherPhotos = []
      
      preparedPhotos.forEach((photo, index) => {
        if(index > 1) otherPhotos.push(photo)
      })
  
      firstPhoto.reduceRatioTo(2)
      secondPhoto.reduceRatioTo(2)
  
      let firstPhotoRatio = firstPhoto.width / firstPhoto.height
      let secondPhotoRatio = secondPhoto.width / secondPhoto.height
      
      if(firstPhotoRatio <= 1.25 && secondPhotoRatio <= 1.25) {
        otherPhotos.forEach(photo => {
          if(photo.width > photo.height) {
          } else if(photo.width < photo.height) {
            photo.setHeightRatio(1)
          }
        })
        readyPhotos = renderHorizontally([[firstPhoto, secondPhoto], otherPhotos])
      } else if(firstPhotoRatio > 1.25 && secondPhotoRatio > 1.25) {
        firstPhoto.reduceRatioTo(1.5)
        secondPhoto.reduceRatioTo(1.5)
        otherPhotos.forEach(photo => photo.setWidthRatio(1))
        readyPhotos = renderVertically([[firstPhoto, secondPhoto], otherPhotos])
      } else {
        otherPhotos.forEach(photo => {
          if(photo.height > photo.width) {
            photo.setHeightRatio(1)
          }
        })
        readyPhotos = renderHorizontally([[firstPhoto, secondPhoto], otherPhotos])
      }
    }
  }

  
  return <div style={{width: '100%'}} ref={gallery}>
    {readyPhotos}
    <PhotoSlider 
      images={preparedLargePictures}
      visible={viewerIsOpen}
      onClose={closeLightbox}
      index={currentImageIndex}
      onIndexChange={setCurrentImageIndex}
    />
  </div>
})

const PhotoContainer = (props) => {
  let classes = useStyles()
  
  return (
    <div
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.12)',
        backgroundImage: `url(${props.src})`,
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        paddingTop: `${props.height}%`,
        width: `${props.width}%`,
        marginBottom: props.marginBottom,
        borderRadius: props.imageBorderRadius,
        cursor: 'pointer'
      }}
      className={classes.photoContainer}
    >
      <div onClick={props.onClick} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,}}></div>
      { props.editMode &&
        <div className={classes.removePhoto} onClick={props.onClose}>
          <CancelTwoToneIcon fontSize='medium' />
        </div>
      }
    </div>
  )
}

function scaleToHeight(neededHeight) {
  if(this.height > this.width) {
    let ratio = this.height / this.width
    this.height = neededHeight
    this.width = neededHeight / ratio
  } else if(this.width > this.height) {
    let ratio = this.width / this.height 
    this.height = neededHeight
    this.width = neededHeight * ratio
  } else {
    this.height = neededHeight
    this.width = neededHeight
  }
}

function scaleToWidth(neededWidth) {
  if(this.height > this.width) {
    let ratio = this.height / this.width
    this.width = neededWidth
    this.height = neededWidth * ratio
  } else if(this.width > this.height) {
    let ratio = this.width / this.height 
    this.width = neededWidth
    this.height = neededWidth / ratio
  } else {
    this.height = neededWidth
    this.width = neededWidth
  }
}

function reduceRatioTo(neededRatio) {
  if (this.height > this.width) {
    let ratio = this.height / this.width
    if (ratio > neededRatio) {
      this.height = this.width * neededRatio
    }
  } else if (this.width > this.height) {
    let ratio = this.width / this.height
    if (ratio > neededRatio) {
      this.width = this.height * neededRatio 
    }
  }
}

function setWidthRatio(ratio) {
  this.width = this.height * ratio
}

function setHeightRatio(ratio) {
  this.height = this.width * ratio
}

const getBiggestHeight = (photos) => {
  let biggestHeight = 0
  photos.forEach(photo => {
    biggestHeight = photo.height > biggestHeight ? photo.height : biggestHeight
  })

  return biggestHeight
}

const getBiggestWidth = (photos) => {
  let biggestWidth = 0
  photos.forEach(photo => {
    biggestWidth = photo.width > biggestWidth ? photo.width : biggestWidth
  })

  return biggestWidth
}

function scalePhotosToHeight(height) {
  this.scaleToHeight(height)
  this.photos.forEach(photo => {
    photo.scaleToWidth(this.width)
  })
}

function scalePhotosToWidth(width) {
  this.scaleToWidth(width)
  this.photos.forEach(photo => {
    photo.scaleToHeight(this.height)
  })
}

function reduceWidth(value) {
  this.width -= value
  this.photos.forEach(photo => {
    photo.width -= value
  })
}

function setPhotosHeightPercents() {
  this.photos.forEach(photo => {
    if(photo.height > photo.width) {
      photo.heightPercents = 100 * (photo.height / photo.width)
    } else if(photo.height < photo.width) {
      photo.heightPercents = 100 / (photo.width / photo.height)
    } else {
      photo.heightPercents = 100
    }
    this.heightPercents += photo.heightPercents
  })
}

function setPhotosWidthPercents(spacing) {
  let allSpacing = spacing * (this.photos.length - 1)
  this.photos.forEach(photo => {
    photo.widthPercents = ((photo.width / this.width) * 100) - (allSpacing / this.photos.length)
  })
}

export default SimplePhotoGallery