import {Link} from "react-router-dom"

const date = new Date()
const today = new Intl.DateTimeFormat('en-US', {dateStyle: 'full',timeStyle: 'long'}).format(date)

const Welcome = () => {

    const content = (
       <section className="welcome"> 
        <p>{today}</p>

        <h1>welcome!</h1>

        <p><Link to="/dash/notes"> View Technotes</Link></p>

        <p><Link to="/dash/users"> View User Settings</Link></p>

       </section>
    )

  return content

}

export default Welcome
