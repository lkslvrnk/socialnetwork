import React, { useEffect, useRef, useState } from 'react'
import { useHistory, useLocation} from 'react-router-dom'
import {useDispatch, useSelector} from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SearchStyles.js'
import { Button, InputBase, List, ListItem, ListItemText, Paper } from '@material-ui/core'
import Preloader from '../Common/Preloader/Preloader.jsx';
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { appAPI } from '../../api/api';
import { actions } from '../../redux/users_reducer';
import SearchIcon from "@material-ui/icons/Search"
import SearchResultItem from './SearchResultItem';

const Search: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const users = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)
  const loadMoreButton = useRef(null)
  const [moreResultsLoading, setMoreResultsLoading] = useState(false)
  const location = useLocation()
  const history = useHistory()

  let queryParams = new URLSearchParams(location.search);
  let textFromQuery: string | null = queryParams.get('query')
  let searchText = textFromQuery === null ? '' : textFromQuery

  const [fieldText, setFieldText] = useState(searchText)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    (async function() {
      setIsSearching(true)
      try {
        let response = await appAPI.searchUsers(searchText, 10, null)
        let data = response.data
        dispatch(actions.setUsers(data.items, data.count, data.cursor))
      } catch(error) {
        console.log(error)
      } finally {
        setIsSearching(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textFromQuery])

  useEffect(() => {
    document.title = t('Search')
    return () => {
      dispatch(actions.clean())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMore = async () => {
    try {
      setMoreResultsLoading(true)
      let response = await appAPI.searchUsers(searchText, 10, cursor)
      let data = response.data
      dispatch(actions.addUsers(data.items, data.count, data.cursor))
    } catch(error) {
      console.log(error)
    } finally {
      setMoreResultsLoading(false)
    }
  }

  const onSearchChange = (e: any) => {
    setFieldText(e.target.value)
  }

  const handleSearch = async (e: any) => {
    if(e.keyCode === 13) {
      history.push(`/search?query=${fieldText}`)
    }
  }

  const renderPanel = <div className={classes.panel}>
    <StickyPanel top={55}>
      <Paper style={{width: 300}}>
        <List dense component="nav" >
          <ListItem
            button
            selected={true}
          >
            <ListItemText primary={t(`People`)} />
          </ListItem>
        </List>
      </Paper>
    </StickyPanel>
  </div>

  let subscriptionsList = users && users.map(user => {
    return <SearchResultItem key={user.id} found={user} />
  })

  return <section className={classes.root}>
    <main className={classes.search}>

      <div className={classes.searchInput}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          onKeyDown={ handleSearch }
          placeholder={ t("Search…") }
          onChange={ onSearchChange }
          value={ fieldText }
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
      </div>
      
      { isSearching
        ? <Preloader />
        : subscriptionsList
      }
      <div style={{display: 'flex', justifyContent: 'center'}} ref={loadMoreButton} >
        { !!users && !!cursor &&
          <div className={classes.moreButtonContainer}>
            <Button onClick={ handleLoadMore } >
              {t('Load more')}
            </Button>   
            { moreResultsLoading &&
              <div className={classes.moreButtonLoading}>
                <Preloader />
              </div>
            }
          </div>
        }
      </div>
    </main>

    { renderPanel }
    
  </section>
})

export default Search
