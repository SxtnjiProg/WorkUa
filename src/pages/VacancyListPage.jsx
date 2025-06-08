import React, { useState, useEffect } from "react";
import { Container, Form, ButtonGroup, Button, Modal, Row, Col } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import VacancyForm from "../components/VacancyForm";
import VacancyList from "../components/VacancyList";
import { LOCALSTORE_VACANCIES, LOCALSTORE_CURRENT_USER } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";

const VacancyListPage = () => {
    const [role, setRole] = useState("guest");
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all");
    const [vacancies, setVacancies] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
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
    }, []);

    const getLocalStore = () => {
        const storedVacancies = window.localStorage.getItem(LOCALSTORE_VACANCIES);
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));

        if (storedVacancies) {
            try {
                const parsedVacancies = JSON.parse(storedVacancies);
                if (Array.isArray(parsedVacancies)) {
                    const validatedVacancies = parsedVacancies.map(vacancy => {
                        if (!vacancy.createdAt || isNaN(new Date(vacancy.createdAt).getTime())) {
                            console.warn(`Invalid createdAt for vacancy ${vacancy.id}: ${vacancy.createdAt}`);
                            return { ...vacancy, createdAt: new Date().toISOString() };
                        }
                        return vacancy;
                    });

                    if (!currentUser || currentUser.role === "admin") {
                        setVacancies(validatedVacancies.map(v => ({
                            ...v,
                            applied: false,
                            status: "Не відгукнуто",
                        })));
                    } else {
                        const storedApplied = JSON.parse(window.localStorage.getItem("appliedVacancies") || "[]");
                        const userApplied = storedApplied.filter(v => v.userId === currentUser.id);
                        setVacancies(validatedVacancies.map(v => ({
                            ...v,
                            applied: userApplied.some(applied => applied.id === v.id),
                            status: userApplied.some(applied => applied.id === v.id) ? "Відгукнуто" : "Не відгукнуто",
                        })));
                    }
                } else {
                    console.warn("Stored vacancies is not an array:", parsedVacancies);
                    initializeDefaultVacancies();
                }
            } catch (error) {
                console.error("Error parsing vacancies from localStorage:", error);
                initializeDefaultVacancies();
            }
        } else {
            initializeDefaultVacancies();
        }
    };

    const initializeDefaultVacancies = () => {
        const initialVacancies = [
            {
                id: 1,
                name: "Frontend Developer",
                company: "SoftGroup",
                salary: 35000,
                image: "/softgroup.jpg",
                applied: false,
                hidden: false,
                location: "Івано-Франківськ",
                status: "Не відгукнуто",
                description: "Ми шукаємо досвідченого фронтенд-розробника...",
                createdBy: null,
                appliedUsers: [],
                createdAt: new Date().toISOString(),
            },
            {
                id: 2,
                name: "Data Analyst",
                company: "DataTech",
                salary: 30000,
                image: "/datatech.png",
                applied: false,
                hidden: false,
                location: "Івано-Франківськ",
                status: "Не відгукнуто",
                description: "Шукаємо аналітика даних...",
                createdBy: null,
                appliedUsers: [],
                createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            },
            {
                id: 3,
                name: "Game Developer (Unity/C#)",
                company: "Playrix",
                salary: 25000,
                image: "/greenlogistics.png",
                applied: false,
                hidden: false,
                location: "Remote / Глобально",
                status: "Не відгукнуто",
                description: "Розробка ігор на Unity...",
                createdBy: null,
                appliedUsers: [],
                createdAt: "2025-05-30T00:00:00.000Z",
            },
        ];
        setVacancies(initialVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(initialVacancies));
    };

    useEffect(() => {
        getLocalStore();
    }, []);

    const handleToggleApply = (id) => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser || currentUser.role === "admin") {
            if (currentUser && currentUser.role === "admin") {
                alert("Адміністратори не можуть відгукуватися на вакансії.");
            }
            return;
        }

        const storedApplied = JSON.parse(window.localStorage.getItem("appliedVacancies") || "[]");
        const isApplied = storedApplied.some(v => v.id === id && v.userId === currentUser.id);

        let updatedApplied;
        if (!isApplied) {
            updatedApplied = [
                ...storedApplied,
                {
                    id,
                    title: vacancies.find(v => v.id === id).name,
                    company: vacancies.find(v => v.id === id).company,
                    userId: currentUser.id,
                },
            ];
        } else {
            updatedApplied = storedApplied.filter(v => v.id !== id || v.userId !== currentUser.id);
        }

        window.localStorage.setItem("appliedVacancies", JSON.stringify(updatedApplied));

        setVacancies(vacancies.map(v => {
            if (v.id === id) {
                return {
                    ...v,
                    applied: !isApplied,
                    status: !isApplied ? "Відгукнуто" : "Не відгукнуто",
                    appliedUsers: !isApplied
                        ? [...(v.appliedUsers || []), { userId: currentUser.id, name: currentUser.name }]
                        : (v.appliedUsers || []).filter(u => u.userId !== currentUser.id),
                };
            }
            return v;
        }));
    };

    const handleDelete = (id) => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        const vacancy = vacancies.find((v) => v.id === id);
        if (vacancy.createdBy && vacancy.createdBy !== currentUser?.id) {
            alert("Ви не можете видалити цю вакансію, оскільки її створив інший адміністратор.");
            return;
        }
        const updatedVacancies = vacancies.filter((v) => v.id !== id);
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
    };

    const handleHide = (id) => {
        const updatedVacancies = vacancies.map((v) =>
            v.id === id ? { ...v, hidden: true } : v
        );
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
    };

    const handleAddVacancy = (newVacancy) => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        const createdAt = new Date().toISOString();
        const updatedVacancies = [
            ...vacancies,
            {
                ...newVacancy,
                id: Date.now(),
                applied: false,
                hidden: false,
                status: "Не відгукнуто",
                appliedUsers: [],
                createdBy: currentUser?.id || null,
                salary: parseInt(newVacancy.salary) || 0,
                createdAt,
            },
        ];
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
    };

    const handleLogout = () => {
        window.localStorage.removeItem(LOCALSTORE_CURRENT_USER);
        setVacancies(vacancies.map(v => ({
            ...v,
            applied: false,
            status: "Не відгукнуто",
        })));
        navigate("/");
    };

    const filteredVacancies = vacancies.filter((v) => {
        const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            v.company.toLowerCase().includes(searchTerm.toLowerCase());
        if (!matchesSearch) return false;
        if (v.hidden && role === "guest") return false;
        if (filter === "new") {
            const createdAt = new Date(v.createdAt);
            const now = new Date();
            const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
            return daysDiff <= 14;
        }
        if (filter === "it") return v.name.toLowerCase().includes("dev");
        if (filter === "analyst") return v.name.toLowerCase().includes("analyst");
        if (filter === "manager") return v.name.toLowerCase().includes("manager");
        return true;
    });

    const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));

    const handleResumeClick = (e) => {
        if (!currentUser || currentUser.role === "admin") {
            e.preventDefault();
            if (currentUser && currentUser.role === "admin") {
                alert("Адміністратори не можуть розміщувати резюме.");
            } else {
                setShowModal(true);
            }
        }
    };

    const handleCloseModal = () => setShowModal(false);
    const handleLoginRedirect = () => {
        handleCloseModal();
        navigate("/login");
    };

    const handleSearch = (e) => {
        e.preventDefault();
        getLocalStore();
        setSearchTerm(searchTerm);
    };

    return (
        <div className="page-wrapper">
            <Container fluid className={`work-container ${showModal ? "blurred" : ""}`}>
                <header className={`header-main ${isHeaderVisible ? "" : "hidden"}`}>
                    <div className="header-left">
                        <Link to="/" className="logo">WORK.ua</Link>
                    </div>
                    <div className="header-center">
                        <Form onSubmit={handleSearch} className="search-form">
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
                        <Link to="/login" className="btn btn-outline-light">
                            Знайти вакансії
                        </Link>
                        <Link
                            to="/resume"
                            className="btn btn-outline-light"
                            onClick={handleResumeClick}
                        >
                            Розмістити резюме
                        </Link>
                        {!currentUser && (
                            <Button variant="outline-light" onClick={() => setShowModal(true)}>
                                Увійти
                            </Button>
                        )}
                        {currentUser && (
                            <>
                                <Link
                                    to={currentUser.role === "admin" ? "/admin" : "/user"}
                                    className="profile-button"
                                >
                                    <img src="/Profile.jpg" alt="Profile" className="profile-icon" />
                                </Link>
                            </>
                        )}
                        <div className="language-switch">
                            <span>В Україні</span> <span>|</span> <Link to="/employer">Роботодавцю</Link>
                        </div>
                    </div>
                </header>

                <Row className="m-0 justify-content-center">
                    <Col md={10}>
                        <ButtonGroup className="mb-3 filter-buttons">
                            <Button
                                variant="secondary"
                                onClick={() => setFilter("all")}
                                className={filter === "all" ? "active" : ""}
                            >
                                Всі
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setFilter("new")}
                                className={filter === "new" ? "active" : ""}
                            >
                                Нові
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setFilter("it")}
                                className={filter === "it" ? "active" : ""}
                            >
                                IT
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setFilter("analyst")}
                                className={filter === "analyst" ? "active" : ""}
                            >
                                Аналітик
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => setFilter("manager")}
                                className={filter === "manager" ? "active" : ""}
                            >
                                Менеджер
                            </Button>
                        </ButtonGroup>
                    </Col>
                </Row>

                <Row className="m-0 justify-content-center">
                    <Col md={6}>
                        {role === "admin" && <VacancyForm onAdd={handleAddVacancy} />}
                        {filteredVacancies.length === 0 ? (
                            <div className="no-results">
                                УУпс... нічого не знайдено :(
                            </div>
                        ) : (
                            <VacancyList
                                vacancies={filteredVacancies}
                                onApply={handleToggleApply}
                                onDelete={role === "admin" ? handleDelete : null}
                                onHide={role === "guest" ? handleHide : null}
                                role={role}
                                showModal={showModal}
                                setShowModal={setShowModal}
                                dislikeImage="/images/dislike.png"
                            />
                        )}
                    </Col>
                </Row>

                <Modal show={showModal} onHide={handleCloseModal} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Вхід</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>Будь ласка, увійдіть або зареєструйтесь, щоб розмістити резюме.</p>
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
            </Container>

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
                                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-2 14v-2c0-1.66-1.34-3-3-3h-1c-1.66 0-3 1.34-3 3v2h-2v-2c0-2.76 2.24-5 5-5h1c2.76 0 5 2.24 5 5v2h-2zm-7-7c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm6 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"/>
                                </svg>
                            </a>
                            <a href="https://twitter.com" aria-label="Twitter">
                                <svg width="24" height="24" fill="#ffffff" viewBox="0 0 24 24">
                                    <path d="M22 4.01c-.81.36-1.68.6-2.59.71a4.52 4.52 0 0 0 1.98-2.49 9.05 9.05 0 0 1-2.87 1.1A4.52 4.52 0 0 0 15 2a4.52 4.52 0 0 0-4.52 4.52c0 .35.04.7.11 1.03A12.82 12.82 0 0 1 1.67 3.15a4.52 4.52 0 0 0-.61 2.27A4.52 4.52 0 0 0 3 9.44a4.5 4.5 0 0 1-2.05-.57v.06A4.52 4.52 0 0 0 4.52 13a4.5 4.5 0 0 1-2.04.08 4.52 4.52 0 0 0 4.22 3.14A9.06 9.06 0 0 1 1 18.54a12.8 12.8 0 0 0 6.93 2.03c8.31 0 12.86-6.9 12.86-12.86 0-.2 0-.39-.01-.58A9.18 9.18 0 0 0 22 4.01z"/>
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

export default VacancyListPage;