import React, {useEffect, useRef} from 'react';
import { useStyles } from './StickyPanelStyles'

const StickyPanel = ({top, children}) => {

  const classes = useStyles({top});
  const panel = useRef(null)

  useEffect(() => {
    let onScroll = () => {
      let panelHeight = panel.current.getBoundingClientRect().height
      let panelTop = Number(panel.current.style.top.split('p')[0])

      let fromStickyTopToViewportBottom = panelTop < 0
        ? Math.abs(panelTop) + window.innerHeight : window.innerHeight - panelTop

      if(panelHeight > fromStickyTopToViewportBottom) {
        let newPanelStickyTop = window.innerHeight - panelHeight
        panel.current.style.top = `${newPanelStickyTop}px`
      }
      else if(panelHeight < fromStickyTopToViewportBottom) {
        let newPanelStickyTop = panelTop + (fromStickyTopToViewportBottom - panelHeight)

        if(newPanelStickyTop > 64) {
          newPanelStickyTop = 64
        }
        panel.current.style.top = `${newPanelStickyTop}px`
      }
    }
    
    document.addEventListener('scroll', onScroll)

    return () => {
      document.removeEventListener('scroll', onScroll)
    }
  }, [])

  return (
    <div
      className={classes.panel}
      ref={panel}
    >
      {children}
    </div>
  )
}

export default StickyPanel
