import React from 'react';
import './App.scss';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';
import Auth from './pages/Auth';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Switch>
          <Redirect from="/" to="/auth" exact />
          <Route path="/auth" component={Auth} />
          <Route path="/events" component={null} />
          <Route path="/bookings" component={null} />
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
