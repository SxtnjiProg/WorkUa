import { useNavigate } from 'react-router-dom';
import '../styles/Error.css';

export default function Error() {
    const navigate = useNavigate();

    return (
        <div className="error-container">
            <div className="error-card">
                <h1 className="error-title">404 - Сторінку не знайдено</h1>
                <p className="error-message">Вибачте, сторінка, яку ви шукаєте, не існує.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="error-button"
                >
                    Повернутися назад
                </button>
            </div>
        </div>
    );
}