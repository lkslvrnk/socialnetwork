import React, { Suspense} from 'react';
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import App from './App';
import store from "./redux/redux_store"

type PropsType = {
}

const SocialNetwork: React.FC<PropsType> = (props) => {
  const renderTranslationFallback = (
    <div
      style={{
        background: 'black',
        width: '1300px',
        height: '1100px'
      }}
    />
  )

  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <Suspense fallback={renderTranslationFallback} >
            <App />
          </Suspense>
        </Provider>
      </BrowserRouter>
    </>
  )
}

export default SocialNetwork
