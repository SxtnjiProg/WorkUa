import React, { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { uk } from "date-fns/locale";
import { LOCALSTORE_VACANCIES, LOCALSTORE_CURRENT_USER } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/vacancy-detail.css";

const VacancyDetailPage = () => {
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [vacancies, setVacancies] = useState([]);
    const [time, setTime] = useState(Date.now());
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const storedVacancies = window.localStorage.getItem(LOCALSTORE_VACANCIES);
        if (storedVacancies) {
            const parsedVacancies = JSON.parse(storedVacancies);
            const foundVacancy = parsedVacancies.find((v) => v.id === parseInt(id));
            setVacancy(foundVacancy);
            setVacancies(parsedVacancies);

            if (foundVacancy) {
                addViewedVacancy(foundVacancy, currentUser.id);
            }
        }

        const interval = setInterval(() => {
            setTime(Date.now());
        }, 60000);

        return () => clearInterval(interval);
    }, [id, navigate]);

    const addViewedVacancy = (vacancy, userId) => {
        const viewedVacancies = JSON.parse(window.localStorage.getItem("viewedVacancies") || "[]");
        const isAlreadyViewed = viewedVacancies.some(
            (v) => v.id === vacancy.id && v.userId === userId
        );
        if (!isAlreadyViewed) {
            viewedVacancies.push({
                id: vacancy.id,
                title: vacancy.name,
                company: vacancy.company,
                location: vacancy.location,
                salary: vacancy.salary,
                userId: userId,
            });
            window.localStorage.setItem("viewedVacancies", JSON.stringify(viewedVacancies));
        }
    };

    const handleApply = () => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser || currentUser.role === "admin") {
            if (currentUser && currentUser.role === "admin") {
                alert("Адміністратори не можуть відгукуватися на вакансії.");
            } else {
                navigate("/login");
            }
            return;
        }
        navigate(`/apply/${id}`);
    };

    const handleRemoveApply = () => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) {
            navigate("/login");
            return;
        }

        const storedVacancies = JSON.parse(window.localStorage.getItem(LOCALSTORE_VACANCIES));
        const updatedVacancies = storedVacancies.map((v) => {
            if (v.id === parseInt(id)) {
                const updatedAppliedUsers = v.appliedUsers.filter((u) => u.userId !== currentUser.id);
                return {
                    ...v,
                    applied: updatedAppliedUsers.length > 0,
                    status: updatedAppliedUsers.length > 0 ? "Відгукнуто" : "Не відгукнуто",
                    appliedUsers: updatedAppliedUsers,
                };
            }
            return v;
        });
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
        setVacancy(updatedVacancies.find((v) => v.id === parseInt(id)));
        setVacancies(updatedVacancies);

        const storedApplied = JSON.parse(window.localStorage.getItem("appliedVacancies") || "[]");
        const updatedApplied = storedApplied.filter(
            (v) => v.id !== parseInt(id) || v.userId !== currentUser.id
        );
        window.localStorage.setItem("appliedVacancies", JSON.stringify(updatedApplied));

        alert("Відгук видалено!");
    };

    const handleHide = () => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const storedVacancies = JSON.parse(window.localStorage.getItem(LOCALSTORE_VACANCIES));
        const updatedVacancies = storedVacancies.map((v) =>
            v.id === parseInt(id) ? { ...v, hidden: true } : v
        );
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
        navigate("/");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchTerm) {
            navigate(`/search?query=${searchTerm}`);
        }
    };

    const formatTimeElapsed = (createdAt) => {
        if (!createdAt) {
            console.warn(`No createdAt provided for vacancy ${vacancy?.id || "unknown"}`);
            return "Невідомо";
        }
        try {
            const date = new Date(createdAt);
            if (isNaN(date.getTime())) {
                console.warn(`Invalid createdAt value for vacancy ${vacancy?.id || "unknown"}: ${createdAt}`);
                return "Невідомо";
            }
            return formatDistanceToNow(date, { addSuffix: true, locale: uk });
        } catch (error) {
            console.warn(`Error formatting date for vacancy ${vacancy?.id || "unknown"}: ${createdAt}`, error);
            return "Невідомо";
        }
    };

    const hotVacancies = vacancies.filter(
        (v) => v.name.toLowerCase().includes("dev") && v.id !== parseInt(id)
    );

    if (!vacancy) {
        return <Container>Вакансію не знайдено</Container>;
    }

    const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
    const hasApplied = vacancy.appliedUsers?.some((u) => u.userId === currentUser?.id);

    return (
        <Container fluid className="vacancy-detail-container p-0">
            <header className="header-main">
                <div className="header-left">
                    <Link to="/" className="logo">WORK.ua</Link>
                </div>
                <div className="header-center">
                    <Form inline onSubmit={handleSearch} className="search-form">
                        <Form.Control
                            type="text"
                            placeholder="Пошук за професією, компанією, ключовим словом"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <Button type="submit" variant="danger" className="search-button">
                            Пошук
                        </Button>
                    </Form>
                </div>
                <div className="header-right">
                    <Link to="/login" className="btn btn-outline-light">Знайти вакансії</Link>
                    <Link to="/resume" className="btn btn-outline-light">Розмістити резюме</Link>
                    <div className="language-switch">
                        <span>В Україні</span> <span>|</span> <Link to="/employer">Роботодавцю</Link>
                    </div>
                </div>
            </header>

            <div className="vacancy-detail-wrapper">
                <div className="vacancy-main">
                    <div className="vacancy-detail-card">
                        <div className="vacancy-header">
                            <img src={vacancy.image} alt="logo" className="vacancy-logo-large" />
                            <div>
                                <h2>{vacancy.name}</h2>
                                <h5>{vacancy.company}</h5>
                                <div className="salary">{vacancy.salary.toLocaleString()} грн</div>
                            </div>
                        </div>
                        <div className="vacancy-meta">
                            <span>📍 {vacancy.location}</span>
                            <span>📅 {formatTimeElapsed(vacancy.createdAt)}</span>
                        </div>
                        <p className="vacancy-description">{vacancy.description}</p>
                        <div>
                            {hasApplied ? (
                                <Button
                                    variant="danger"
                                    onClick={handleRemoveApply}
                                    style={{ marginRight: "10px" }}
                                >
                                    Видалити відгук
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    onClick={handleApply}
                                    style={{ marginRight: "10px" }}
                                >
                                    Відгукнутися
                                </Button>
                            )}
                            <Button variant="outline-secondary" onClick={handleHide}>
                                Не цікаво
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="vacancy-sidebar">
                    <div className="hot-vacancies-container">
                        <h4 className="hot-vacancies-title">ГАРЯЧІ ВАКАНСІЇ</h4>
                        <div className="hot-vacancies-list">
                            {hotVacancies.length > 0 ? (
                                hotVacancies.map((v) => (
                                    <Link key={v.id} to={`/vacancy/${v.id}`} className="hot-vacancy-tile">
                                        <div className="hot-vacancy-content">
                                            <div className="hot-vacancy-header">
                                                <h5>{v.name}</h5>
                                                <span className="hot-vacancy-time">{formatTimeElapsed(v.createdAt)}</span>
                                            </div>
                                            <div className="hot-vacancy-salary">
                                                <span className="currency-icon">₴</span> {v.salary.toLocaleString()}
                                            </div>
                                            <div className="hot-vacancy-meta">
                                                <span>{v.company}, {v.location}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p>Немає гарячих вакансій з "dev".</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default VacancyDetailPage;