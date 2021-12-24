import React, {Fragment, useState, useEffect, useRef, useCallback} from 'react'
import { useTranslation } from 'react-i18next'
import {NavLink, useHistory} from 'react-router-dom'
import { useStyles } from './SearchStyles.js'
import { ClickAwayListener, Divider } from '@material-ui/core'
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import SearchIcon from "@material-ui/icons/Search"
import { Avatar, FormControl, InputBase, Select } from '@material-ui/core'
import { debounce } from '../../helper/helperFunctions.js'
import { appAPI, imagesStorage } from '../../api/api'
import BeachAccessIcon from '@material-ui/icons/BeachAccess'
import Preloader from '../Common/Preloader/Preloader.jsx'

const Search = React.memo(props => {
  const { t } = useTranslation()
  const classes = useStyles()

  const [searchResults, setSearchResults] = useState({
    items: [],
    cursor: null,
    allCount: null
  })
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchingPanel, setShowSearchingPanel] = useState(false)

  useEffect(() => {
    if(searchText) {
      makeSearch(searchText)
    }
  }, [searchText])

  const makeSearch = useCallback(debounce(async (text) => {
    try {
      let response = await appAPI.searchUsersMini(text, 7, searchResults.cursor)
      if(response.status === 200) {
        setSearchResults({
          items: response.data.items,
          cursor: response.data.cursor,
          count: response.data.count
        })
      }
    } catch (err) {
      console.log(err)
    } finally {
      setIsSearching(false)
    }
  }, 300), [])

  const onSearchChange = (e) => {
    const text = e.target.value
    if(text) {
      setIsSearching(true)
      setShowSearchingPanel(true)
    } else {
      setIsSearching(false)
      setShowSearchingPanel(false)
    }
    setSearchText(e.target.value)
  }

  const removeSearch = (e) => {
    setSearchText('')
    setSearchResults({
      items: [],
      cursor: null,
      allCount: null
    })
    setShowSearchingPanel(false)
  }

  const resultItems = searchResults.items

  return (
    <ClickAwayListener onClickAway={ () => setShowSearchingPanel(false)}>
      <div className={classes.search}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          placeholder={ t("Search…") }
          onChange={ onSearchChange }
          value={ searchText }
          onFocus={ () => {
            if(searchText) setShowSearchingPanel(true)
          }}
          classes={{
            root: classes.inputRoot,
            input: showSearchingPanel ? classes.inputInputWithOpenPanel : classes.inputInput
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
        { showSearchingPanel &&
        <Paper className={ classes.searchPanel }>
          { isSearching ?
            <div className={classes.preloader} >
              <Preloader />
            </div>
            :
            ((resultItems.map((user, index) => {
              let name = `${user.firstname} ${user.lastname}`
              let picture = user.picture && `${imagesStorage}${user.picture}`
              let link = `/i/${user.username}`
              return (
                <>
                <div className={classes.searchResultItem} onClick={ removeSearch}>
                  <Avatar
                    src={picture}
                    component={NavLink}
                    to={link}
                  />
                  <Typography
                    variant='body2'
                    component={NavLink}
                    to={link}
                    style={{ marginLeft: 16}}
                    children={name}
                    color='textPrimary'
                  />
                </div>
                </>
              )
              }))
            )
          }
          { !isSearching && searchText &&
            <>
              { resultItems.length > 0 && <Divider /> }
              <NavLink
                className={classes.showAllResults}
                to={`/search?query=${searchText}`}
                onClick={ removeSearch}
              >
                <Typography color='textPrimary'>{t('Show all results')}</Typography>
              </NavLink>
            </>
          }
        </Paper> }
      </div>
    </ClickAwayListener>
  )
})

export default Search
