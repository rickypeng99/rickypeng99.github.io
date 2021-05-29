import PAGE_TYPE from './pageTypes'
import AboutPage from './variants/AboutPage'
import ProjectPage from './variants/ProjectPage'

export default function Page(props) {
    switch (props.variant) {
        default:
            return <AboutPage />
    }
}