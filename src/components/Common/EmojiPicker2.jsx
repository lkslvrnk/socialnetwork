import React, { useEffect, useRef, useState } from 'react'
import {useTranslation} from 'react-i18next';
import { useTheme } from '@material-ui/core/styles'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import { ClickAwayListener, Popper } from '@material-ui/core';

const EmojiPicker2 = ({isOpened, button, onSelect, onClose, buttonWrapperStyles}) => {
	const { t } = useTranslation();
	const theme = useTheme()

	// const onKeyPress = (e) => {
  //   console.log(e.keyCode + '__' + e.which)
  //   var code = e.keyCode ? e.keyCode : e.which;
  //   if(code === 27 && show) {
  //     onClose()
  //   }
  // }

  const buttonWrapper = useRef(null)
  const [anchor, setAnchor] = useState(null)

  useEffect(() => {
    setAnchor(isOpened ? buttonWrapper.current : null)
  }, [isOpened])

  const handleClose = () => {
    setAnchor(null)
    onClose()
  }

  const translations = {
    search: t('Search'),
    categories: {
      search: t('Search results'),
      recent: t('Recent'),
      smileys: t('Smileys & Emotion'),
      people: t('People & Body'),
      nature: t('Animals & Nature'),
      foods: t('Food & Drink'),
      activity: t('Activity'),
      places: t('Travel & Places'),
      objects: t('Objects'),
      symbols: t('Symbols'),
      flags: t('Flags'),
      custom: t('Custom'),
    },
    categorieslabel: t('Emoji categories'),
    skintones: {
      1: t('Default Skin Tone'),
      2: t('Light Skin Tone'),
      3: t('Medium-Light Skin Tone'),
      4: t('Medium Skin Tone'),
      5: t('Medium-Dark Skin Tone'),
      6: t('Dark Skin Tone'),
    },
  }

  const renderPicker = (
    <Picker
      onSelect={onSelect}
      theme={theme.palette.type}
      set='google'
      i18n={translations}
    />
  )

	return (
    <div style={buttonWrapperStyles}>
      <ClickAwayListener onClickAway={handleClose} >
        <div ref={buttonWrapper}>
          {button}
          <Popper
            open={!!anchor}
            anchorEl={anchor}
            transition
            modifiers={{ offset: { enabled: true, offset: '0, 10' } }}
            style={{zIndex: 1}}
          >
            {renderPicker}
          </Popper>
        </div>
      </ClickAwayListener>
    </div>
	)
}

export default EmojiPicker2
