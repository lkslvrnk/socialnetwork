import React, { useEffect, useRef } from 'react'
import { Fade, Popper } from '@material-ui/core';

const AutoTogglingPopper = props => {
  const {children, openArea, fadeTimeout, placement, anchor, setAnchor, openTimeout, closeTimeout} = props

  let placement1 = placement

  if(!['bottom', 'top', 'right', 'left'].includes(placement)) {
    placement1 = 'bottom'
  }

  const showTimeout = useRef(null);
  const hideTimeout = useRef(null);

  const stopPostMenuHiding = () => {
    clearTimeout(hideTimeout.current)
  }
  useEffect(() => {
    clearTimeout(showTimeout.current)
  }, [anchor])

  const open = (e) => {
    let target = e.currentTarget
    clearTimeout(hideTimeout.current)
    
    if(!Boolean(anchor)) {
      showTimeout.current = setTimeout(() => {
        setAnchor(target)
      }, openTimeout | 0);
    }
  }

  const close = (e) => {
    if(!anchor) {
      clearTimeout(showTimeout.current)
    }
    hideTimeout.current = setTimeout(() => {
      setAnchor(null)
    }, closeTimeout | 200);
  }

  return (
    <div onMouseLeave={close} >

      <div onMouseEnter={open} >
        { openArea }
      </div>

      <Popper
        open={Boolean(anchor)}
        anchorEl={anchor}
        placement={placement1}
        transition
        onMouseEnter={stopPostMenuHiding}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={fadeTimeout}>
            {children}
          </Fade>
        )}
      </Popper>

    </div>
  )
}

export default AutoTogglingPopper