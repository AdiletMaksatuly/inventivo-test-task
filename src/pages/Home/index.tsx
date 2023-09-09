import {Link} from "react-router-dom";
import styles from './HomePage.module.css';

export default function HomePage() {
    return (
        <section>
            <h1>Добрый день, уважаемый пользователь!</h1>
            <Link className={styles.start} to={'/camera'}>Старт</Link>
        </section>);
}
