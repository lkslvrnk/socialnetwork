import React, {useState, useEffect, useRef} from 'react'
import RadioButtonUncheckedIcon from '@material-ui/icons/RadioButtonUnchecked'
import CheckCircleIcon from '@material-ui/icons/CheckCircle'
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone'
import { PhotoSlider } from 'react-photo-view'
import { useStyles } from './PhotoGalleryStyles'

let glBorderRadius = 0
let glEditMode = false
let glSelectMode = false
let glPlace = null

const PhotoGallery = React.memo((props) => {
  const {place, imageBorderRadius, editMode, passedImages, spacing, selectMode, setAttachments} = props
  
  const [photosLoaded, setPhotosLoaded] = useState(false)
  const classes = useStyles()
  const maxHeightPercents = 80
  glBorderRadius = imageBorderRadius
  glEditMode = editMode
  glSelectMode = selectMode
  glPlace = place

  const lastHeight = useRef(null)
  const photos = useRef([])
  const [imageChangingCount, setImageChangingCount] = useState(0)
  const gallery = useRef(null)

  console.log(photos)

  const preparedLargePictures = []

  photos.current.forEach((photo) => {
    preparedLargePictures.push({src: photo.originalSrc})
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

  function getPhotoMeta(url, withMetaLoadedCounter) {
    let img = new Image();
    img.onload = function() {
      let photoSrcAndID = passedImages.filter(image => image.mediumSrc === url)[0]
      withMetaLoadedCounter.handledCount++
      withMetaLoadedCounter.handledPhotos.push(createPhotoObject(photoSrcAndID, this.width, this.height))
      withMetaLoadedCounter.onMetaLoaded()
    };
    img.src = url
  }

  const createPhotoObject = (photosSrcAndID, width, height) =>  {
    let photo = {
      originalSrc: photosSrcAndID.originalSrc,
      mediumSrc: photosSrcAndID.mediumSrc,
      id: photosSrcAndID.id
    }
    
    photo.originalWidth = photo.width = width
    photo.originalHeight = photo.height = height
    photo.heightPercents = 0
    photo.widthPercents = 0
    photo.discardDimensions = discardDimensions.bind(photo)
    photo.reduceRatioTo = reduceRatioTo.bind(photo)
    photo.scaleToHeight = scaleToHeight.bind(photo)
    photo.scaleToWidth = scaleToWidth.bind(photo)
    photo.discard = discard.bind(photo)
    photo.setWidthRatio = setWidthRatio.bind(photo)
    photo.setHeightRatio = setHeightRatio.bind(photo)
    photo.checked = false
    
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
    wrapper.addPhoto = addPhoto.bind(wrapper)

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
  
  useEffect(() => {
    if(passedImages.length > 0 ) {
      setPhotosLoaded(true)
    } else {
      setPhotosLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if(photosLoaded) {
      let updatedPhotos = [...photos.current]
      photos.current.forEach(photo => {
        let match = passedImages.filter(passedImage => passedImage.mediumSrc === photo.mediumSrc)[0]
        if(!match) {
          updatedPhotos = updatedPhotos.filter(photo1 => photo1.mediumSrc !== photo.mediumSrc)
        }
      })
      photos.current = updatedPhotos

      let newPhotos = []
      passedImages.forEach(image => {
        let match = photos.current.filter(photo => {
          return image.mediumSrc === photo.mediumSrc
        })[0]
        if(!match) newPhotos.push(image)
      })

      console.log(newPhotos)
      let withMetaLoadedCounter = {
        newPhotosCount: newPhotos.length,
        handledCount: 0,
        handledPhotos: [] 
      }

      function onMetaLoaded(){
        if(this.newPhotosCount === this.handledCount) {
          this.handledPhotos.forEach(handled => {
            console.log(handled)
            let existed = photos.current.filter(photo => photo.mediumSrc === handled.mediumSrc)[0]
            if(!existed) {
              photos.current.push(handled)
            }
          })
          setImageChangingCount(prev => prev + 1)
        }
      }

      withMetaLoadedCounter.onMetaLoaded = onMetaLoaded.bind(withMetaLoadedCounter)

      if(newPhotos.length) {
        newPhotos.forEach(newPhoto => {
          getPhotoMeta(newPhoto.mediumSrc, withMetaLoadedCounter)
        })
      } else {
        setImageChangingCount(prev => prev + 1)
      }
      
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photosLoaded, passedImages.length])

  useEffect(() => {
    const photosCount = photos.current.length
    if(photosCount === 1 || photosCount === 2) {
      lastHeight.current = photos.current[0].wrapperHeight
    } else if(photosCount > 2) {
      
    }
  }, [photosLoaded])

  let forOnePhoto = () => {
    let photo = photos.current[0]
    let galleryWidth = gallery.current.getBoundingClientRect().width
    let galleryHeight = galleryWidth
    let photoOrigHeight = photo.originalHeight
    let photoOrigWidth = photo.originalWidth

    let widthPercents = photoOrigWidth / galleryWidth * 100
    let heightPercents = photoOrigHeight / galleryHeight * 100
    
    if(widthPercents > 100) {
      heightPercents = (photoOrigHeight / photoOrigWidth) * 100
      widthPercents = 100
    }
    if(heightPercents > maxHeightPercents) {
      heightPercents = maxHeightPercents
      widthPercents = heightPercents / (photoOrigHeight / photoOrigWidth)
    }
    if(widthPercents < 100 && photoOrigWidth > photoOrigHeight) {
      heightPercents = widthPercents / (photoOrigWidth / photoOrigHeight)
    } 
    return (
      <div
        style={{
          width: '100%', display: 'flex', justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            backgroundImage: `url(${photo.mediumSrc})`,
            width: `${widthPercents}%`,
            paddingTop: `${heightPercents}%`,
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'relative',
            borderRadius: imageBorderRadius,
            overflow: 'hidden',
          }}
        >
          <div
            onClick={() => openLightbox(0)}
            style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,}}
          />
          { glEditMode && <div
            className={classes.removePhoto}
            onClick={() => {
              setAttachments(prev => {
                return prev.filter(image => image.mediumSrc !== photo.mediumSrc)
              })
            }}
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
              style={{
                width: `${wrapper.widthPercents}%`,
              }}
            >
              {wrapper.photos.map((photo, index) => {
                let wrapperLength = wrapper.photos.length
                let currentPhoto = index + 1
                let spacingHeightInWrapper = spacing * (100 / wrapper.widthPercents)
                let allSpacings = spacingHeightInWrapper * (wrapperLength - 1)
                
                return (
                  <>
                    <PhotoContainer
                      src={photo.mediumSrc}
                      id={photo.id}
                      height={photo.heightPercents - (allSpacings / wrapperLength)}
                      width={100} 
                      editMode={editMode}
                      allPhotos={photos.current}
                      onClose={ () => {
                        setAttachments(prev => {
                          return prev.filter(image => image.mediumSrc !== photo.mediumSrc)
                        })
                      }}
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
              className={classes.rowWrapper}
              style={{
                marginBottom: index < (wrappers.length - 1) ? `${spacing}%` : null
              }}
            >
              {wrapper.photos.map((photo, index) => {
                return (
                  <PhotoContainer
                    src={photo.mediumSrc}
                    id={photo.id}
                    height={wrapper.heightPercents}
                    width={photo.widthPercents} 
                    onClose={() => {
                      setAttachments(prev => {
                        return prev.filter(image => image.mediumSrc !== photo.mediumSrc)
                      })
                    }}
                    onClick={() => openLightbox(photo.index)}
                    allPhotos={photos.current}
                  />
                )
              })}
            </div>
          )
        })}
      </div>
    )
  }

  function addPhoto(photo) {
    photo.reduceRatioTo(this.ratio)
    if(this.photos.length > 0) {
      photo.scaleToHeight(this.height)
    } else {
      this.height = photo.height
    }
    let ratio = photo.width / photo.height

    if((this.filledBlocks + ratio) > this.blocks) {
      throw new Error('Wrapper filled')
    }

    this.photos.push(photo)
    this.filledBlocks += ratio

    this.width += photo.width
  }

  let readyPhotos = null
  if(photosLoaded) {
    photos.current.forEach(photo => photo.discard())

    let photosWithIndex = []
    photos.current.forEach((photo, index) => {
      photo.index = index
      photosWithIndex.push(photo)
    })

    const photosLength = photosWithIndex.length

    if(photosLength === 1) {
      readyPhotos = forOnePhoto()
    } else if(photosLength === 2) {
      let firstPhoto = photosWithIndex[0]
      let secondPhoto = photosWithIndex[1]

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
      let firstPhoto = photosWithIndex[0]
      let secondPhoto = photosWithIndex[1]
      let thirdPhoto = photosWithIndex[2]

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
      let firstPhoto = photosWithIndex[0]
      let secondPhoto = photosWithIndex[1]
      let thirdPhoto = photosWithIndex[2]
      let fourthPhoto = photosWithIndex[3]

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
      let firstPhoto = photosWithIndex[0]
      let secondPhoto = photosWithIndex[1]
      let otherPhotos = []
      
      photosWithIndex.forEach((photo, index) => {
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
    } else if (photosLength > 8) {
    }
  }
  return <div ref={gallery}>
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
        backgroundImage: `url(${props.src})`,
        paddingTop: `${props.height}%`,
        width: `${props.width}%`,
        marginBottom: props.marginBottom,
        borderRadius: glBorderRadius,
      }}
      className={classes.photoContainer}
    >
      <div onClick={props.onClick} style={{position: 'absolute', top: 0, bottom: 0, left: 0, right: 0,}}></div>
      { glEditMode && <div className={classes.removePhoto} onClick={props.onClose}>
        <CancelTwoToneIcon fontSize='medium' />
      </div>
      }
    </div>
  )
}

const SelectButton = (props) => {
  let classes = useStyles()

  return (
    <div
      style={{
        position: 'absolute', 
        left: 0,
        top: 0, 
        cursor: 'pointer',
      }}
      onClick={props.onClick}
      children={
        <div className={classes.selectPhoto}>
          { props.isChecked ? 
            <CheckCircleIcon
              fontSize='large'
              color='primary'
            />
            :
            <RadioButtonUncheckedIcon fontSize='large' />
          }
        </div>
      }
    />
  )
}

const CloseButton = (props) => {
  let classes = useStyles()

  return (
    <div
      style={{
        position: 'absolute', 
        right: 2,
        top: 2, 
        cursor: 'pointer',
      }}
      onClick={props.onClick}
      children={
        <div className={classes.removePhoto}>
          <CancelTwoToneIcon fontSize='medium' />
        </div>
      }
    />
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

function discardDimensions() {
  this.height = this.originalHeight
  this.width = this.originalWidth
}

function discard() {
  this.discardDimensions()
  this.heightPercents = 0
  this.widthPercents = 0
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

export default PhotoGallery