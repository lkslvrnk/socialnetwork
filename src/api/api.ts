import  axios from 'axios'
import { ProfileType } from '../types/types';

export const baseUrl = 'https://otval.space'

export const imagesStorage = `${baseUrl}/images/for-photos/`
let websocketUrl = 'ws://localhost:1234/'

export const instance = axios.create({
  withCredentials: false,
  baseURL: baseUrl,
  headers: {'Content-Type':  'application/json'}
})

instance.interceptors.request.use(function (config) {
    const jwt = localStorage.getItem("JWT")
    if(jwt) {
      config.headers.Authorization = `bearer ${jwt}`
    }
    return config;
  },
);

type SearchUsersResponseType = {
  items: Array<ProfileType>,
  count: number,
  cursor: string | null
}

export const appAPI = {
  searchUsers(text: string, count: number | null, cursor: string | null) {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    return instance.get<SearchUsersResponseType>(`/search?query=${text}${countParam}${cursorParam}&full-profile=1`)
  },
  searchUsersMini(text: string, count: number | null, cursor: string | null) {
    const countParam = count ? `&count=${count}` : ''
    const cursorParam = cursor ? `&cursor=${cursor}` : ''
    return instance.get(`/search?query=${text}${countParam}${cursorParam}`)
  }
}

export const usersAPI = {
  getUsers(currentPage: number | null = null, pageSize: number | null = null) {
    return instance.get(`users?page=${currentPage}&count=${pageSize}`)
      .then(response => response.data)
  }
}

let websocketConnection: any = null;

export const websocketsAPI = {
  connectToWebsocket(userId: string, onMessage: (messageData: object, userId: string) => void, onError: () => void) {

    websocketConnection = new WebSocket(`${websocketUrl}?token=lolkek&userId=${userId}`);
    websocketConnection.onopen = function () {
  	};
    websocketConnection.onerror = function (error: any) {
      onError()
    };
    websocketConnection.onmessage = function (message: any) {
      onMessage(JSON.parse(message.data), userId)
    }
    websocketConnection.onclose = function () {
    }
  },
  closeWebsocketConnection() {
    if(websocketConnection !== null) {
      if(websocketConnection.readyState) {
        websocketConnection.close()
      }
    }
  },
  sendMessage: (queryString: string) => {
    websocketConnection.send(`${websocketUrl}?token=lolkek&${queryString}`)
  }
}
