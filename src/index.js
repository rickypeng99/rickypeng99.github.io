import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';

import Page from './pages';
import PAGE_TYPE from './pages/pageTypes'

// import components
import NavBar from './components/NavBar';



ReactDOM.render(
  <React.StrictMode>
    <NavBar />
    <Page variant={PAGE_TYPE.ABOUT_PAGE}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
