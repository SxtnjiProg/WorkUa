import React, { useState, useEffect } from "react";
import { Container, Button, Card, ListGroup, Modal } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { LOCALSTORE_CURRENT_USER, LOCALSTORE_VACANCIES, LOCALSTORE_RESUMES } from "../models/constants";
import VacancyForm from "../components/VacancyForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/admin-dashboard.css";

const ACCEPT_IMAGE_URL = "";
const REJECT_IMAGE_URL = "";

const AdminPage = () => {
    const [user, setUser] = useState(null);
    const [vacancies, setVacancies] = useState([]);
    const [newVacancy, setNewVacancy] = useState({
        name: "",
        company: "",
        image: "",
        salary: "",
        location: "",
        description: "",
    });
    const [isHeaderVisible, setIsHeaderVisible] = useState(true);
    const [expandedVacancyId, setExpandedVacancyId] = useState(null);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [selectedResume, setSelectedResume] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser || currentUser.role !== "admin") {
            navigate("/login");
        } else {
            setUser(currentUser);
            const storedVacancies = JSON.parse(window.localStorage.getItem(LOCALSTORE_VACANCIES) || "[]");
            setVacancies(storedVacancies);
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

    const handleAddVacancy = (e) => {
        e.preventDefault();
        if (!newVacancy.name || !newVacancy.company) return;
        const updatedVacancies = [
            ...vacancies,
            {
                ...newVacancy,
                id: Date.now(),
                applied: false,
                hidden: false,
                status: "Не відгукнуто",
                appliedUsers: [],
                createdBy: user.id,
                salary: parseInt(newVacancy.salary) || 0,
            },
        ];
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
        setNewVacancy({
            name: "",
            company: "",
            image: "",
            salary: "",
            location: "",
            description: "",
        });
    };

    const handleDelete = (id) => {
        const vacancy = vacancies.find((v) => v.id === id);
        if (vacancy.createdBy && vacancy.createdBy !== user.id) {
            alert("Ви не можете видалити цю вакансію, оскільки її створив інший адміністратор.");
            return;
        }
        const updatedVacancies = vacancies.filter((v) => v.id !== id);
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
    };

    const handleRejectResume = (vacancyId, userId) => {
        const updatedVacancies = vacancies.map((v) => {
            if (v.id === vacancyId) {
                const updatedAppliedUsers = v.appliedUsers.map((u) =>
                    u.userId === userId ? { ...u, status: "rejected" } : u
                );
                return {
                    ...v,
                    appliedUsers: updatedAppliedUsers,
                };
            }
            return v;
        });
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
    };

    const handleAcceptResume = (vacancyId, userId) => {
        const updatedVacancies = vacancies.map((v) => {
            if (v.id === vacancyId) {
                const updatedAppliedUsers = v.appliedUsers.map((u) =>
                    u.userId === userId ? { ...u, status: "accepted" } : u
                );
                return {
                    ...v,
                    appliedUsers: updatedAppliedUsers,
                };
            }
            return v;
        });
        setVacancies(updatedVacancies);
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
        alert("Резюме прийнято!");
    };

    const handleViewUserResume = (userId) => {
        const allResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
        const vacancyWithUser = vacancies.find((v) =>
            v.appliedUsers && v.appliedUsers.some((u) => u.userId === userId)
        );
        const applicant = vacancyWithUser?.appliedUsers.find((u) => u.userId === userId);
        const userResume = applicant?.resume || allResumes.find((r) => r.userId === userId);
        setSelectedResume(userResume);
        setShowResumeModal(true);
    };

    const handleCloseResumeModal = () => {
        setShowResumeModal(false);
        setSelectedResume(null);
    };

    const handleLogout = () => {
        window.localStorage.removeItem(LOCALSTORE_CURRENT_USER);
        navigate("/");
    };

    const toggleVacancy = (id) => {
        setExpandedVacancyId(expandedVacancyId === id ? null : id);
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
                    <div className="header-right">
                        <Link to="" className="profile-button">
                            <img src="/Profile.jpg" alt="Profile" className="profile-icon" />
                        </Link>
                    </div>
                </header>

                <Container className="admin-container">
                    <div className="admin-dashboard">
                        <h2 className="mb-4">Кабінет адміністратора</h2>
                        <section className="add-vacancy-section mb-6">
                            <h3 className="mb-4">Додати нову вакансію</h3>
                            <VacancyForm
                                name={newVacancy.name}
                                company={newVacancy.company}
                                image={newVacancy.image}
                                salary={newVacancy.salary}
                                location={newVacancy.location}
                                description={newVacancy.description}
                                onNameChange={(e) => setNewVacancy({ ...newVacancy, name: e.target.value })}
                                onCompanyChange={(e) => setNewVacancy({ ...newVacancy, company: e.target.value })}
                                onImageChange={(e) => setNewVacancy({ ...newVacancy, image: e.target.value })}
                                onSalaryChange={(e) => setNewVacancy({ ...newVacancy, salary: e.target.value })}
                                onLocationChange={(e) => setNewVacancy({ ...newVacancy, location: e.target.value })}
                                onDescriptionChange={(e) => setNewVacancy({ ...newVacancy, description: e.target.value })}
                                onSubmit={handleAddVacancy}
                            />
                        </section>
                        <Card className="admin-card mb-4">
                            <Card.Body>
                                <Card.Title className="mb-4">Ваші вакансії</Card.Title>
                                {vacancies.filter((v) => v.createdBy === user.id).length === 0 ? (
                                    <p className="text-muted">Ви ще не додали жодної вакансії.</p>
                                ) : (
                                    <ListGroup className="vacancy-list">
                                        {vacancies
                                            .filter((v) => v.createdBy === user.id)
                                            .map((vacancy) => (
                                                <ListGroup.Item
                                                    key={vacancy.id}
                                                    className={`vacancy-item ${expandedVacancyId === vacancy.id ? "expanded" : ""}`}
                                                    onClick={() => toggleVacancy(vacancy.id)}
                                                >
                                                    <div className="vacancy-header">
                                                        <span className="vacancy-title">{vacancy.name}</span>
                                                        <span className="vacancy-company">{vacancy.company}</span>
                                                    </div>
                                                    {expandedVacancyId === vacancy.id && (
                                                        <div className="vacancy-details">
                                                            <h5 className="mb-2">Відгукнулися:</h5>
                                                            {vacancy.appliedUsers && vacancy.appliedUsers.length > 0 ? (
                                                                <ListGroup className="mb-3">
                                                                    {vacancy.appliedUsers.map((applicant) => (
                                                                        <ListGroup.Item
                                                                            key={applicant.userId}
                                                                            className="applicant-item"
                                                                        >
                                                                            <div className="applicant-name-wrapper">
                                                                                <span
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleViewUserResume(applicant.userId);
                                                                                    }}
                                                                                    className="applicant-name"
                                                                                >
                                                                                    {applicant.name}
                                                                                </span>
                                                                            </div>
                                                                            <div className="action-buttons">
                                                                                <span
                                                                                    className="action-button accept-button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleAcceptResume(vacancy.id, applicant.userId);
                                                                                    }}
                                                                                    title="Прийняти резюме"
                                                                                >
                                                                                    {ACCEPT_IMAGE_URL ? (
                                                                                        <img
                                                                                            src={ACCEPT_IMAGE_URL}
                                                                                            alt="Accept"
                                                                                            className="action-icon"
                                                                                        />
                                                                                    ) : (
                                                                                        "✓"
                                                                                    )}
                                                                                </span>
                                                                                <span
                                                                                    className="action-button reject-button"
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation();
                                                                                        handleRejectResume(vacancy.id, applicant.userId);
                                                                                    }}
                                                                                    title="Відклонити резюме"
                                                                                >
                                                                                    {REJECT_IMAGE_URL ? (
                                                                                        <img
                                                                                            src={REJECT_IMAGE_URL}
                                                                                            alt="Reject"
                                                                                            className="action-icon"
                                                                                        />
                                                                                    ) : (
                                                                                        "✗"
                                                                                    )}
                                                                                </span>
                                                                            </div>
                                                                        </ListGroup.Item>
                                                                    ))}
                                                                </ListGroup>
                                                            ) : (
                                                                <p className="text-muted">Ніхто ще не відгукнувся.</p>
                                                            )}
                                                            <Button
                                                                variant="danger"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(vacancy.id);
                                                                }}
                                                                className="delete-button"
                                                            >
                                                                Видалити
                                                            </Button>
                                                        </div>
                                                    )}
                                                </ListGroup.Item>
                                            ))}
                                    </ListGroup>
                                )}
                            </Card.Body>
                        </Card>
                        <Button variant="danger" onClick={handleLogout} className="logout-button">
                            Вийти
                        </Button>
                    </div>
                </Container>
            </Container>

            <Modal show={showResumeModal} onHide={handleCloseResumeModal} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Резюме користувача</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedResume ? (
                        <>
                            <p><strong>Назва:</strong> {selectedResume.title || "Не вказано"}</p>
                            <p><strong>Навички:</strong> {selectedResume.skills || "Не вказано"}</p>
                            <p><strong>Досвід:</strong> {selectedResume.experience || "Не вказано"}</p>
                            <p><strong>Освіта:</strong> {selectedResume.education || "Не вказано"}</p>
                        </>
                    ) : (
                        <p>Резюме цього користувача не знайдено.</p>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseResumeModal}>
                        Закрити
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AdminPage;