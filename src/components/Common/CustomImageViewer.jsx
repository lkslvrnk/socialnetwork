import React from 'react'
import ImageViewer from "react-simple-image-viewer";
import {makeStyles} from "@material-ui/core/styles";

export const useStyles = makeStyles(theme => ({
  '@global': {
    '#ReactSimpleImageViewer': {
      zIndex: 9999
    }
  }
}))

const CustomImageViewer = ({src, currentIndex, onClose, show}) => {

  useStyles()

  if(!show) {
    return null
  }

	return (
    <ImageViewer
      src={src}
      currentIndex={currentIndex}
      onClose={onClose}
      disableScroll={true}
      backgroundStyle={{
        backgroundColor: "rgba(20, 20, 20, 0.9)"
      }}
      closeOnClickOutside={true}
    />
  )
}

export default CustomImageViewer
