
import Header from '../components/header/Header'
import Footer from '../components/footer/Footer'

function layout({ children }) {
    return (
        <main>
            <Header />
            {children}
            <Footer />
        </main>
    )
}

export default layout