import React from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
} from "react-router-dom";

import App from "./App";
import Dash from "./DashBoard/Dash";
import PersDashboard from "./DashBoard/PersDashboard";
import Success from "./Home/Succes";

function MultiPages() {
    return (
        <Router>
            <Routes>
                <Route exact path="/" element={<App />} />
                <Route exact path="/dash" element={<Dash></Dash>} />
                <Route path="/workspace/:name" element={<PersDashboard />} />
                <Route exact path="/success" element={<Success></Success>} />




            </Routes>
        </Router>
    );
}
 
export default MultiPages;
