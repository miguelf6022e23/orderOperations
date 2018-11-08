import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import {Container} from './components/Grid'
import Banner from './components/Banner/Banner.js';


const App = () => (
  <Router>
  	<Container>
	  	<Banner />
	  	<Switch>
	  		<Route exact path="/" component={Home} />
	    </Switch>
    </Container>
  </Router>
);

export default App;
