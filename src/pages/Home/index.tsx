import {Link} from "react-router-dom";

export default function HomePage() {
    return (
        <section>
            <h1>Добрый день, уважаемый пользователь!</h1>
            <Link className={'btn'} to={'/camera'}>Старт</Link>
        </section>);
}
