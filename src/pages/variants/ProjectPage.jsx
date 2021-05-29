import './pageStyle.css'

function ProjectPage() {
    return (
        <div>
            <video autoPlay muted loop id="intro_video">
                <source src="/assets/videos/joker.mp4" type="video/mp4"/>
            </video>
            <h1 class="display-4">Hello, world!</h1>
            <p class="lead">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>
            <hr class="my-4" />

        </div>
    )
}

export default ProjectPage
