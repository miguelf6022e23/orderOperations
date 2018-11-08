import React from 'react';
import { Link } from 'react-router-dom';

const Banner = () => (
	<nav className="navbar navbar-expand-lg navbar-dark bg-dark">
    <Link className="navbar-brand" to="/">
      Order of Operations Helper
    </Link>
  </nav>
	);


export default Banner;
