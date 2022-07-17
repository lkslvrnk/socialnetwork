import  axios from 'axios'
import { ProfileType } from '../types/types';
import Pusher from 'pusher-js'

export const baseUrl = 'https://sn-back-api.herokuapp.com/v1'
// export const baseUrl = 'http://localhost:8000/v1'
export const imagesStorage = `http://localhost:8000/images/forphotos/`

Pusher.logToConsole = false;
export const pusher = new Pusher('e6cbd9d805e4f4e0a599', {
  cluster: 'eu'
});

export const pusher2 = new Pusher('e6cbd9d805e4f4e0a599', {
  cluster: 'eu'
});

export const instance = axios.create({
  withCredentials: false,
  baseURL: baseUrl,
  headers: {'Content-Type': 'application/json'}
})

instance.interceptors.request.use(function (config) {
    const jwt = localStorage.getItem("JWT")
    if(jwt) {
      config.headers.Authorization = `bearer ${jwt}`
    }
    return config;
  },
)

type SearchUsersResponseType = {
  items: Array<ProfileType>,
  count: number,
  cursor: string | null
}

export const appAPI = {
  searchUsers(text: string, count: number | null, cursor: string | null) {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    return instance.get<SearchUsersResponseType>(
      `/search?query=${text}${countParam}${cursorParam}&fields=firstname,lastname,picture,username`
    )
  },
  searchUsersMini(text: string, count: number | null, cursor: string | null) {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    return instance.get(
      `/search?query=${text}${countParam}${cursorParam}&fields=firstname,lastname,picture,username`
    )
  }
}

export const usersAPI = {
  getUsers(currentPage: number | null = null, pageSize: number | null = null) {
    return instance.get(`users?page=${currentPage}&count=${pageSize}`)
      .then(response => response.data)
  }
}
