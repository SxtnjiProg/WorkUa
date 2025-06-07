import React, { useState, useEffect } from "react";
import { Container, Button, Card, Tabs, Tab, Form, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { LOCALSTORE_CURRENT_USER, LOCALSTORE_RESUMES, LOCALSTORE_VACANCIES } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/user-dashboard.css";

const UserPage = () => {
    const [user, setUser] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [viewedVacancies, setViewedVacancies] = useState([]);
    const [appliedVacancies, setAppliedVacancies] = useState([]);
    const [activeTab, setActiveTab] = useState("profile");
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [showEditModal, setShowEditModal] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) {
            navigate("/login");
        } else {
            setUser(currentUser);
            const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
            setResumes(storedResumes.filter((r) => r.userId === currentUser.id));
            const storedViewed = JSON.parse(window.localStorage.getItem("viewedVacancies") || "[]");
            setViewedVacancies(storedViewed.filter((v) => v.userId === currentUser.id));
            const storedApplied = JSON.parse(window.localStorage.getItem("appliedVacancies") || "[]");
            const storedVacancies = JSON.parse(window.localStorage.getItem(LOCALSTORE_VACANCIES) || "[]");
            const enrichedAppliedVacancies = storedApplied
                .filter((v) => v.userId === currentUser.id)
                .map((applied) => {
                    const vacancy = storedVacancies.find((v) => v.id === applied.id);
                    const applicant = vacancy?.appliedUsers?.find((u) => u.userId === currentUser.id);
                    return {
                        ...applied,
                        status: applicant?.status || "pending",
                    };
                });
            setAppliedVacancies(enrichedAppliedVacancies);
        }

        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setIsHeaderVisible(false);
            } else {
                setIsHeaderVisible(true);
            }
            lastScrollY = currentScrollY;
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [navigate]);

    const handleLogout = () => {
        window.localStorage.removeItem(LOCALSTORE_CURRENT_USER);
        navigate("/");
    };

    const handleEditResume = (resume) => {
        setCurrentResume({ ...resume });
        setShowEditModal(true);
    };

    const handleDeleteResume = () => {
        if (window.confirm("Ви впевнені, що хочете видалити це резюме?")) {
            const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
            const updatedResumes = storedResumes.filter((r) => r.id !== currentResume.id);
            window.localStorage.setItem(LOCALSTORE_RESUMES, JSON.stringify(updatedResumes));
            setResumes(updatedResumes.filter((r) => r.userId === user.id));
            setShowEditModal(false);
        }
    };

    const handleSaveResume = () => {
        const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
        const updatedResumes = storedResumes.map((r) =>
            r.id === currentResume.id ? { ...currentResume } : r
        );
        window.localStorage.setItem(LOCALSTORE_RESUMES, JSON.stringify(updatedResumes));
        setResumes(updatedResumes.filter((r) => r.userId === user.id));
        setShowEditModal(false);
    };

    const handleResumeChange = (e) => {
        const { name, value } = e.target;
        setCurrentResume((prev) => ({ ...prev, [name]: value }));
    };

    const getStatusText = (status) => {
        const statusMap = {
            pending: "Очікується",
            accepted: "Прийнята",
            rejected: "Відхилена",
        };
        return statusMap[status] || "Очікується";
    };

    if (!user) {
        return <Container>Завантаження...</Container>;
    }

    return (
        <div className="page-wrapper">
            <Container fluid className="work-container">
                <header className={`header-main ${isHeaderVisible ? "" : "hidden"}`}>
                    <div className="header-left">
                        <Link to="/" className="logo">WORK.ua</Link>
                    </div>
                    <div className="header-center">
                        <Form className="search-form">
                            <Form.Control
                                type="text"
                                placeholder="Пошук за професією, компанією, ключовим словом"
                                className="search-input"
                                disabled
                            />
                            <Button variant="danger" className="search-button" disabled>
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

                <Container className="user-container">
                    <div className="tabs-container">
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k)}
                            className="profile-tabs"
                        >
                            <Tab eventKey="profile" title="Мій профіль">
                                <Card className="profile-card">
                                    <Card.Body>
                                        <div className="profile-header">
                                            <img src="/Profile.jpg" alt="Profile" className="profile-avatar" />
                                            <div>
                                                <Card.Title className="profile-title">{user.name || "Користувач"}</Card.Title>
                                                <Card.Subtitle className="profile-subtitle">{user.email || "Немає email"}</Card.Subtitle>
                                            </div>
                                        </div>
                                        <div className="profile-details rounded-container">
                                            <h5>Особисті дані</h5>
                                            <p><strong>Email:</strong> {user.email || "Немає email"}</p>
                                            <p><strong>Роль:</strong> {user.role || "Користувач"}</p>
                                            <p><strong>Дата реєстрації:</strong> {user.registrationDate || "Невідомо"}</p>
                                        </div>
                                        {resumes.length > 0 && (
                                            <div className="resume-section rounded-container mt-4">
                                                <h5>Ваші резюме</h5>
                                                {resumes.map((resume) => (
                                                    <div key={resume.id} className="resume-item">
                                                        <div className="resume-header">
                                                            <button
                                                                className="edit-icon-button"
                                                                onClick={() => handleEditResume(resume)}
                                                                title="Редагувати резюме"
                                                            >
                                                                <svg
                                                                    width="16"
                                                                    height="16"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="#3b82f6"
                                                                    strokeWidth="2"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <div className="resume-content">
                                                            <div>
                                                                <strong>{resume.title || "Без назви"}</strong>
                                                                <p>{resume.skills}</p>
                                                                <p className="resume-status">Доступно роботодавцям: Завжди</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="viewed" title="Переглянуті вакансії">
                                <Card className="profile-card">
                                    <Card.Body>
                                        {viewedVacancies.length > 0 ? (
                                            viewedVacancies.map((vacancy) => (
                                                <Link
                                                    key={vacancy.id}
                                                    to={`/vacancy/${vacancy.id}`}
                                                    className="resume-item vacancy-link"
                                                >
                                                    <strong>{vacancy.title}</strong>
                                                    <p>{vacancy.company}</p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p>Ви ще не переглядали вакансії.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                            <Tab eventKey="applied" title="Відгукнуті вакансії">
                                <Card className="profile-card">
                                    <Card.Body>
                                        {appliedVacancies.length > 0 ? (
                                            appliedVacancies.map((vacancy) => (
                                                <Link
                                                    key={vacancy.id}
                                                    to={`/vacancy/${vacancy.id}`}
                                                    className={`resume-item vacancy-link ${vacancy.status === "accepted" ? "accepted" : vacancy.status === "rejected" ? "rejected" : ""}`}
                                                >
                                                    <strong>{vacancy.title}</strong>
                                                    <p>{vacancy.company}</p>
                                                    <p className="vacancy-status">Статус: {getStatusText(vacancy.status)}</p>
                                                </Link>
                                            ))
                                        ) : (
                                            <p>Ви ще не відгукнулися на вакансії.</p>
                                        )}
                                    </Card.Body>
                                </Card>
                            </Tab>
                        </Tabs>
                        <Button variant="danger" onClick={handleLogout} className="logout-button">
                            Вийти
                        </Button>
                    </div>
                </Container>
            </Container>

            {/* Модальне вікно для редагування резюме */}
            <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Редагувати резюме</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {currentResume && (
                        <Form>
                            <Form.Group className="mb-3">
                                <Form.Label>Назва резюме</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="title"
                                    value={currentResume.title || ""}
                                    onChange={handleResumeChange}
                                    placeholder="Введіть назву резюме"
                                />
                            </Form.Group>
                            <Form.Group className="mb-3">
                                <Form.Label>Навички</Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={3}
                                    name="skills"
                                    value={currentResume.skills || ""}
                                    onChange={handleResumeChange}
                                    placeholder="Опишіть ваші навички"
                                />
                            </Form.Group>
                        </Form>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" onClick={handleDeleteResume}>
                        Видалити
                    </Button>
                    <div className="ms-auto">
                        <Button variant="secondary" onClick={() => setShowEditModal(false)} className="me-2">
                            Скасувати
                        </Button>
                        <Button variant="primary" onClick={handleSaveResume}>
                            Зберегти
                        </Button>
                    </div>
                </Modal.Footer>
            </Modal>

            <footer className="footer">
                <div className="footer-content">
                    <div className="footer-section footer-logo">
                        <Link to="/" className="logo">WORK.ua</Link>
                        <p>Найкраща платформа для пошуку роботи в Україні.</p>
                    </div>
                    <div className="footer-section footer-links">
                        <h5>Корисні посилання</h5>
                        <ul>
                            <li><Link to="/vacancies">Вакансії</Link></li>
                            <li><Link to="/resume">Резюме</Link></li>
                            <li><Link to="/employer">Для роботодавців</Link></li>
                        </ul>
                    </div>
                    <div className="footer-section footer-contact">
                        <h5>Контакти</h5>
                        <p>📞 +380 66 646 8954</p>
                        <p>📧 support@work.ua</p>
                        <p>📍 м. Київ, вул. Робоча, 1</p>
                    </div>
                    <div className="footer-section footer-social">
                        <h5>Ми в соціальних мережах</h5>
                        <div className="social-icons">
                            <a href="https://facebook.com" aria-label="Facebook">
                                <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                                    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H7v-3h3V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z"/>
                                </svg>
                            </a>
                            <a href="https://linkedin.com" aria-label="LinkedIn">
                                <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-2.5 14v-2c0-1.66-1.34-3-3-3h-1c-1.66 0-3 1.34-3 3v2h-2v-2c0-2.76 2.24-5 5-5h1c2.76 0 5 2.24 5 5v2h-2zm-7-7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm6 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                                </svg>
                            </a>
                            <a href="https://twitter.com" aria-label="Twitter">
                                <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                                    <path d="M22 4.01c-.81.36-1.68.6-2.59.71a4.52 4.52 0 0 0 1.98-2.49 9.05 9.05 0 0 1-2.87 1.1A4.52 4.52 0 0 0 15 2a4.52 4.52 0 0 0-4.52 4.52c0 .35.04 .7.11 1.03A12.82 12.82 0 0 1 1.67 3.15a4.52 4.52 0 0 0-.61 2.27A4.52 4.52 0 0 0 3 9.44a4.5 4.5 0 0 1-2.05-.57v.06A4.52 4.52 0 0 0 4.52 13a4.5 4.5 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.14A9.06 9.06 0 0 1 1 18.54a12.8 12.8 0 0 0 6.93 2.03c8.31 0 12.86-6.9 12.86-12.86 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 22 4.01z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 WORK.ua. Всі права захищені.</p>
                </div>
            </footer>
        </div>
    );
};

export default UserPage;