import {createSelector} from 'reselect'


export const getUsers = createSelector(
    state => state.usersPage.users,
    users => users.filter(user => user)
)

export const getCurrentPage = (state) => {
    return state.usersPage.currentPage
}

export const getPageSize = (state) => {
    return state.usersPage.pageSize
}

export const getTotalUsersCount = (state) => {
    return state.usersPage.totalUsersCount
}

export const getIsFetching = (state) => {
    return state.usersPage.isFetching
}
