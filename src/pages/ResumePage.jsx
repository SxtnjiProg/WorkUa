import React, { useState, useEffect } from "react";
import { Container, Button, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { LOCALSTORE_CURRENT_USER, LOCALSTORE_RESUMES } from "../models/constants";
import ResumeForm from "../components/ResumeForm";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";

const ResumePage = () => {
    const [user, setUser] = useState(null);
    const [resumes, setResumes] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) {
            navigate("/login");
        } else {
            setUser(currentUser);
            const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
            setResumes(storedResumes.filter((r) => r.userId === currentUser.id));
        }
    }, [navigate]);

    const handleResumeSubmit = (resumeData) => {
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) return;

        const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
        const userResumes = storedResumes.filter((r) => r.userId === currentUser.id);

        if (userResumes.length >= 1) {
            alert("Ви можете мати лише одне резюме. Видаліть старе резюме, щоб додати нове.");
            return;
        }

        const newResume = {
            id: Date.now(),
            userId: currentUser.id,
            ...resumeData,
        };
        const updatedResumes = [...storedResumes, newResume];
        window.localStorage.setItem(LOCALSTORE_RESUMES, JSON.stringify(updatedResumes));

        setResumes(updatedResumes.filter((r) => r.userId === currentUser.id));
        alert("Резюме успішно збережено!");
        navigate("/");
    };

    const handleLogout = () => {
        window.localStorage.removeItem(LOCALSTORE_CURRENT_USER);
        navigate("/");
    };

    if (!user) {
        return <Container>Завантаження...</Container>;
    }

    return (
        <Container fluid className="work-container">
            <header className="header-main">
                <div className="header-left">
                    <Link to="/" className="logo">WORK.ua</Link>
                </div>
                <div className="header-center">
                    <Form inline className="search-form">
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
                    <Button variant="danger" onClick={handleLogout}>Вийти</Button>
                    <div className="language-switch">
                        <span>В Україні</span> <span>|</span> <Link to="/employer">Роботодавцю</Link>
                    </div>
                </div>
            </header>

            <Container className="resume-container">
                <Link to="/" className="btn btn-secondary mb-3">
                    Повернутися
                </Link>
                <h2 className="mb-4">Розмістити резюме</h2>
                {resumes.length > 0 && (
                    <div className="mb-4">
                        <h4>Ваші резюме:</h4>
                        {resumes.map((resume) => (
                            <div key={resume.id} className="p-2 border rounded mb-2">
                                <strong>{resume.title || "Без назви"}</strong>: {resume.skills}
                            </div>
                        ))}
                    </div>
                )}
                {resumes.length < 1 && <ResumeForm onSubmit={handleResumeSubmit} />}
            </Container>
        </Container>
    );
};

export default ResumePage;