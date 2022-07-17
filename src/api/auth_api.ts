import { instance as axiosInstance } from './api'

type MeResponseType = {
  id: string
  firstName: string
  lastName: string
  picture: string | null
  email: string
  username: string,
  lastRequestsCheck: number
}

type LoginResponseType = {
  jwt: string
  errors?: Array<string>
}

type SignUpResponseType = {
}

type LogOutResponseType = {
  message: string
  errors?: Array<string>
}

export const authAPI = {
  logIn: (email: string, password: string) => {
    return axiosInstance.post<LoginResponseType>(`auth/login`, {email, password})
  },
  signUp: (
    email: string,
    password: string,
    repeatedPassword: string,
    firstName: string,
    lastName: string,
    username: string,
    sex: string,
    birthday: string,
    language: string
  ) => {
    return axiosInstance.post<SignUpResponseType>(`auth/signup`, {
      email: email,
      password: password,
      repeatedPassword: repeatedPassword,
      firstname: firstName,
      lastname: lastName,
      username,
      sex,
      birthday,
      language
    })
  },
  facebookLogIn(code: string) {
    return axiosInstance.get(
      `auth/fb?code=${code}`
    ).then(
      response => {
        return response.data
      }
    );
  },
  logOut() {
    return axiosInstance.delete<LogOutResponseType>(`auth/login`)
  },
  me: () => {
    return axiosInstance.get<MeResponseType>(`auth/me`)
  },
  setJWT() {
    if(localStorage.getItem("JWT")) {
      axiosInstance.defaults.headers.common.Authorization = `bearer ${localStorage.getItem("JWT")}`;
    }
  },
  removeJWT() {
    localStorage.removeItem("JWT")
  }
}