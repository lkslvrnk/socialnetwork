import React, { Suspense} from 'react';
import { BrowserRouter } from 'react-router-dom'
import { Provider } from "react-redux";
import ReactDOM from 'react-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import './i18n';
import store from "./redux/redux_store"
import App from './App';
import { CircularProgress } from '@material-ui/core';
import Initialization from './components/Common/Initialization';


ReactDOM.render(
  <>
    <BrowserRouter>
      <Provider store={store}>
        <Suspense fallback={<Initialization />} >
          <App />
        </Suspense>
      </Provider>
    </BrowserRouter>
  </>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
