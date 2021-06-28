import React from 'react';
import Config from '../config.json';

export const StoreContext = React.createContext(null);

const ContextStore = ({ children }) => {
  const port = 'BACKEND_PORT' in Config ? Config.BACKEND_PORT : 5000;
  // token stores an Authorized user token upon successfully logging in
  const [token, setToken] = React.useState(null);
  // the page variable stores the current page as a string
  const [page, setPage] = React.useState('/login');
  // object containing all of the users a user is following from a GET API request
  const [following, setFollowing] = React.useState({});

  // another option is simply storing the user info from the GET request
  const [userinfo, setUserinfo] = React.useState({});

  const store = {
    baseUrl: `http://localhost:${port}`,
    token: [token, setToken],
    pageState: [page, setPage],
    following: [following, setFollowing],

    userinfo: [userinfo, setUserinfo],
    
  }
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>
}

export default ContextStore;
