import React, {useState, useEffect, useCallback} from 'react'
import { useTranslation } from 'react-i18next'
import {NavLink, useHistory} from 'react-router-dom'
import { useStyles } from './SearchStyles.js'
import { ClickAwayListener, Divider, List, ListItem } from '@material-ui/core'
import Typography from "@material-ui/core/Typography"
import Paper from "@material-ui/core/Paper"
import SearchIcon from "@material-ui/icons/Search"
import { InputBase } from '@material-ui/core'
import { debounce } from '../../../helper/helperFunctions.js'
import { appAPI } from '../../../api/api'
import Preloader from '../../Common/Preloader/Preloader.jsx'
import SimpleAvatar from '../../Common/SimpleAvatar'
import KeyboardArrowRightIcon from '@material-ui/icons/KeyboardArrowRight';

const Search = React.memo(props => {
  const { t } = useTranslation()
  const classes = useStyles()
  const history = useHistory();

  const [searchResults, setSearchResults] = useState({
    items: [],
    cursor: null,
    allCount: null
  })
  const [searchText, setSearchText] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchingPanel, setShowSearchingPanel] = useState(false)

  const onEnterPress = (event) => {
    if(event.key === 'Enter') {
      event.preventDefault()
      history.push(`/search?query=${searchText}`)
      setSearchText('')
      setSearchResults({
        items: [],
        cursor: null,
        allCount: null
      })
      setShowSearchingPanel(false)
    }
  }

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
    } finally {
      setIsSearching(false)
    }
  }, 300), [])

  useEffect(() => {
    if(searchText) {
      makeSearch(searchText)
    }
  }, [searchText, makeSearch])

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

  const renderInput = <>
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
        input: showSearchingPanel
          ? classes.inputInputWithOpenPanel
          : classes.inputInput
      }}
      onKeyPress={onEnterPress}
      inputProps={{ 'aria-label': 'search' }}
    />
  </>

  const resultItems = searchResults.items

  const renderResults = resultItems.map((user) => {
    let name = `${user.firstName} ${user.lastName}`
    let picture = user.picture ? user.picture.versions.cropped_small : null
    let link = `/i/${user.username}`
    return (
      <ListItem
        button
        onClick={ removeSearch}
        component={NavLink}
        to={link}
        key={user.id}
      >
        <div className={classes.searchResultItem} >
          <SimpleAvatar
            picture={picture}
            width={40}
            name={name}
          />
          <Typography
            variant='subtitle2'
            style={{ marginLeft: 16}}
            children={name}
            color='textPrimary'
          />
        </div>
      </ListItem>
    )
  })

  return (
    <ClickAwayListener onClickAway={() => setShowSearchingPanel(false)}>
      <div className={classes.search}>
        { renderInput }

        { showSearchingPanel &&
          <Paper elevation={3} className={ classes.searchPanel }>
            { isSearching
              ?
              <div className={classes.preloader} >
                <Preloader />
              </div>
              :
              <List dense >
                {renderResults}
              </List>
            }
            { (!isSearching && searchText) && <>
              { resultItems.length > 0 && <Divider /> }
              <NavLink
                className={classes.showAllResults}
                to={`/search?query=${searchText}`}
                onClick={ removeSearch}
              >
                <Typography
                  variant='body2'
                  color='textPrimary'
                  children={t('Show all results')}
                />
                <KeyboardArrowRightIcon color='action'/>
              </NavLink>
            </>}
          </Paper>
        }
      </div>
    </ClickAwayListener>
  )
})

export default Search
