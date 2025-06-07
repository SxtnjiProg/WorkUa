import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import { uk } from 'date-fns/locale';
import { LOCALSTORE_CURRENT_USER, LOCALSTORE_VACANCIES } from "../models/constants";
import "../styles/App.css";

const VacancyItemComponent = ({ vacancy, onApply, onDelete, onHide, role, showModal, setShowModal, dislikeImage }) => {
    const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
    const navigate = useNavigate();
    const [localVacancy, setLocalVacancy] = useState(vacancy);
    const [convertedSalaries, setConvertedSalaries] = useState({ usd: null, eur: null });

    useEffect(() => {
        setLocalVacancy(vacancy);
        const fetchConversion = async () => {
            try {
                const response = await fetch(
                    `https://api.exchangerate-api.com/v4/latest/UAH?symbols=USD,EUR`
                );
                const data = await response.json();
                const usdRate = data.rates.USD;
                const eurRate = data.rates.EUR;
                setConvertedSalaries({
                    usd: (vacancy.salary * usdRate).toFixed(2),
                    eur: (vacancy.salary * eurRate).toFixed(2),
                });
            } catch (error) {
                console.error("Error fetching currency rates:", error);
                const usdRate = 0.025;
                const eurRate = 0.023;
                setConvertedSalaries({
                    usd: (vacancy.salary * usdRate).toFixed(2),
                    eur: (vacancy.salary * eurRate).toFixed(2),
                });
            }
        };
        fetchConversion();
    }, [vacancy]);

    const handleApplyClick = () => {
        if (!currentUser) {
            setShowModal(true);
            return;
        }
        if (currentUser.role === "admin") {
            alert("Адміністратори не можуть відгукуватися на вакансії.");
            return;
        }
        navigate(`/apply/${vacancy.id}`);
    };

    const handleHideClick = () => {
        if (!currentUser) {
            setShowModal(true);
            return;
        }
        onHide(vacancy.id);
    };

    const handleVacancyClick = (e) => {
        if (!currentUser) {
            e.preventDefault();
            setShowModal(true);
        }
    };

    const handleCloseModal = () => setShowModal(false);
    const handleLoginRedirect = () => {
        handleCloseModal();
        navigate("/login");
    };

    const formatTimeElapsed = (createdAt) => {
        if (!createdAt) {
            console.warn(`No createdAt provided for vacancy ${vacancy.id}`);
            return "Невідомо";
        }
        try {
            const date = new Date(createdAt);
            if (isNaN(date.getTime())) {
                console.warn(`Invalid createdAt value for vacancy ${vacancy.id}: ${createdAt}`);
                return "Невідомо";
            }
            return formatDistanceToNow(date, { addSuffix: true, locale: uk });
        } catch (error) {
            console.warn(`Error formatting date for vacancy ${vacancy.id}: ${createdAt}`, error);
            return "Невідомо";
        }
    };

    return (
        <div className="vacancy-tile">
            <Link to={`/vacancy/${localVacancy.id}`} className="tile-left" onClick={handleVacancyClick}>
                <img src={localVacancy.image} alt="logo" className="vacancy-logo" />
                <div>
                    <h5>{localVacancy.name}</h5>
                    <div>{localVacancy.company}</div>
                    <div className="salary">
                        {localVacancy.salary.toLocaleString()} грн
                        {convertedSalaries.usd && convertedSalaries.eur && (
                            <span className="converted-salary">
                                (~${convertedSalaries.usd} / €{convertedSalaries.eur})
                            </span>
                        )}
                    </div>
                    <div className="vacancy-meta">
                        <span>📍 {localVacancy.location}</span>
                        <span>📅 {formatTimeElapsed(localVacancy.createdAt)}</span>
                        <span>📊 {localVacancy.status}</span>
                    </div>
                </div>
            </Link>

            <div className="tile-right">
                <button
                    className="btn btn-apply"
                    onClick={handleApplyClick}
                    disabled={!currentUser || role === "admin" || localVacancy.applied}
                >
                    {localVacancy.applied ? "Відгукнуто" : "Відгукнутися"}
                </button>

                {role === "admin" && onDelete && (
                    <button className="btn btn-danger" onClick={() => onDelete(localVacancy.id)}>
                        Видалити
                    </button>
                )}

                {role === "guest" && onHide && (
                    <img
                        src={dislikeImage}
                        alt="Dislike"
                        className="dislike-icon"
                        onClick={handleHideClick}
                        style={{ cursor: "pointer" }}
                        title="Не цікаво"
                        aria-label="Приховати вакансію"
                    />
                )}
            </div>

            <Modal show={showModal} onHide={handleCloseModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Вхід</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Будь ласка, увійдіть або зареєструйтесь, щоб переглянути деталі вакансії.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Закрити
                    </Button>
                    <Button variant="primary" onClick={handleLoginRedirect}>
                        Увійти
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default VacancyItemComponent;