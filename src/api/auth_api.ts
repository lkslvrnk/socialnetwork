import { instance as axiosInstance } from './api'

type MeResponseType = {
  id: string
  email: string
  username: string
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
    gender: string,
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
      gender,
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
    try {
      return axiosInstance.get<MeResponseType>(`auth/me`)
    } catch(err) {
      console.log(err)
      return null
    }
  },
  setJWT() {
    if(localStorage.getItem("JWT")) {
      axiosInstance.defaults.headers.common.Authorization = `bearer ${localStorage.getItem("JWT")}`;
    }
  },
  removeJWT() {
    localStorage.setItem("JWT", '')
    axiosInstance.defaults.headers.common.Authorization = null;
  }
}