import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHistory, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next';
import { useStyles } from './SearchStyles.js'
import {
  InputBase, List, ListItem, ListItemText, Paper
} from '@material-ui/core'
import Preloader from '../Common/Preloader/Preloader.jsx';
import StickyPanel from '../Common/StickyPanel.js';
import { AppStateType } from '../../redux/redux_store.js';
import { appAPI } from '../../api/api';
import { actions } from '../../redux/users_reducer';
import SearchIcon from "@material-ui/icons/Search"
import SearchResult from './SearchResult';
import { compose } from 'redux';
import { withRedirectToLogin } from '../../hoc/withRedirectToLogin.js';
import classNames from 'classnames';
import { useIntersection } from '../../hooks/hooks.js';
import LoadMore from '../Common/LoadMore.jsx';

const Search: React.FC = React.memo((props) => {
  const classes = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const users = useSelector((state: AppStateType) => state.users.users)
  const cursor = useSelector((state: AppStateType) => state.users.cursor)
  const loadMore = useRef(null)
  const [moreResultsLoading, setMoreResultsLoading] = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const location = useLocation()
  const history = useHistory()

  let queryParams = new URLSearchParams(location.search);
  let textFromQuery: string | null = queryParams.get('query')
  let searchText = textFromQuery === null ? '' : textFromQuery

  const [fieldText, setFieldText] = useState(searchText)
  const [isSearching, setIsSearching] = useState(false)

  const componentName = 'search'

  useEffect(() => {
    (async function () {
      setFieldText(searchText)
      setIsSearching(true)
      try {
        let response = await appAPI.searchUsers(searchText, 10, null)
        let data = response.data
        dispatch(actions.setUsers(
          data.items, data.count, data.cursor, componentName
        ))
      } catch (error) {

      } finally {
        setIsSearching(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textFromQuery])

  useEffect(() => {
    dispatch(actions.setComponentName(componentName))
    document.title = t('Search')
    return () => {
      dispatch(actions.clean())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLoadMore = useCallback(async () => {
    if (!moreResultsLoading && cursor) {
      try {
        setMoreResultsLoading(true)
        setLoadMoreError(false)
        let response = await appAPI.searchUsers(searchText, 10, cursor)
        setMoreResultsLoading(false)
        let data = response.data
        dispatch(actions.addUsers(
          data.items, data.count, data.cursor, componentName
        ))
      } catch (error) {
        setLoadMoreError(true)
        setMoreResultsLoading(false)
      }
    }
  }, [cursor, searchText, moreResultsLoading, dispatch])

  useIntersection(!!users, handleLoadMore, loadMore)

  const onSearchChange = (e: any) => {
    setFieldText(e.target.value)
  }

  const handleSearch = async (e: any) => {
    if (e.keyCode === 13) {
      history.push(`/search?query=${fieldText}`)
    }
  }

  const renderPanel = <div className={'aside-content'}>
    <StickyPanel top={55}>
      <Paper style={{ width: 300 }}>
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

  let resultsList = users && users.map(user => {
    return <SearchResult key={user.id} found={user} />
  })

  return <>
    <main className={classNames(classes.search, 'main-content')}>
      <div className={classes.searchInput}>
        <div className={classes.searchIcon}>
          <SearchIcon />
        </div>
        <InputBase
          onKeyDown={handleSearch}
          placeholder={t("Search…")}
          onChange={onSearchChange}
          value={fieldText}
          classes={{
            root: classes.inputRoot,
            input: classes.inputInput,
          }}
          inputProps={{ 'aria-label': 'search' }}
        />
      </div>

      <div className={classes.searchResults}>
        {isSearching ? <Preloader /> : resultsList}
      </div>

      <LoadMore
        ref={loadMore}
        // @ts-ignore
        show={!!cursor}
        showProgress={moreResultsLoading || loadMoreError}
      />
    </main>

    {renderPanel}
  </>
})

export default compose(
  withRedirectToLogin
)(Search);