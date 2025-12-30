import React from "react"
import './Nav.css'
import { Link } from 'react-router-dom'
function Nav() {
    return (
        <>
        <div className="Nav-con">
            <h2>Let's Do</h2>
            <div className="element">
                <Link to="/home">home</Link>
                <Link to="/card">card</Link>
                <h4 className="">Services</h4>
                <h4 className="">Acount</h4>
            </div>
        </div>
        </>
    )
}

export default Nav