import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

function NavBar() {
    return (
        <Navbar bg="dark" variant="dark" expand="lg">
            <Navbar.Brand href="#">Ricky (Ruiqi) Peng</Navbar.Brand>
            <Navbar.Toggle aria-controls="responsive-navbar-nav" />
            <Navbar.Collapse id="responsive-navbar-nav">
                <Nav className="mr-auto">
                    <a href="#" class="nav-link" role="button">About</a>
                    <a href="#" class="nav-link" role="button">Projects</a>
                    <a href="#" class="nav-link" role="button">Posts</a>
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    )
}
export default NavBar