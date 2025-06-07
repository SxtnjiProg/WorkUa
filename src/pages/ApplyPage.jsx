import React, { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useParams, useNavigate } from "react-router-dom";
import { LOCALSTORE_VACANCIES, LOCALSTORE_CURRENT_USER, LOCALSTORE_RESUMES } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";
import "../styles/apply-page.css"; // Новий файл стилів для модального вікна

const ApplyPage = () => {
    const { id } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [file, setFile] = useState(null);
    const [selectedResumeId, setSelectedResumeId] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [error, setError] = useState("");
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

            if (foundVacancy && foundVacancy.appliedUsers?.some((u) => u.userId === currentUser.id)) {
                setError("Ви вже відгукнулися на цю вакансію.");
            }
        }

        const storedResumes = JSON.parse(window.localStorage.getItem(LOCALSTORE_RESUMES) || "[]");
        setResumes(storedResumes.filter((r) => r.userId === currentUser.id));
    }, [id, navigate]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.size > 5 * 1024 * 1024) {
            setError("Файл перевищує ліміт 5 МБ.");
            setFile(null);
            return;
        }
        setError("");
        setFile(selectedFile);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const currentUser = JSON.parse(window.localStorage.getItem(LOCALSTORE_CURRENT_USER));
        if (!currentUser) return;

        if (!file && !selectedResumeId) {
            setError("Оберіть резюме або завантажте файл.");
            return;
        }

        if (vacancy.appliedUsers?.some((u) => u.userId === currentUser.id)) {
            setError("Ви вже відгукнулися на цю вакансію.");
            return;
        }

        const storedVacancies = JSON.parse(window.localStorage.getItem(LOCALSTORE_VACANCIES));
        const updatedVacancies = storedVacancies.map((v) => {
            if (v.id === parseInt(id)) {
                const appliedResume = selectedResumeId
                    ? resumes.find((r) => r.id === parseInt(selectedResumeId))
                    : { id: Date.now(), userId: currentUser.id, title: file.name, skills: "Завантажено" };
                return {
                    ...v,
                    applied: true,
                    status: "Відгукнуто",
                    appliedUsers: [
                        ...(v.appliedUsers || []),
                        {
                            userId: currentUser.id,
                            name: currentUser.name,
                            resume: appliedResume,
                        },
                    ],
                };
            }
            return v;
        });
        window.localStorage.setItem(LOCALSTORE_VACANCIES, JSON.stringify(updatedVacancies));
        setVacancy(updatedVacancies.find((v) => v.id === parseInt(id)));

        const storedApplied = JSON.parse(window.localStorage.getItem("appliedVacancies") || "[]");
        const newAppliedVacancy = updatedVacancies.find((v) => v.id === parseInt(id));
        if (newAppliedVacancy) {
            const updatedApplied = [
                ...storedApplied.filter((v) => v.userId !== currentUser.id || v.id !== parseInt(id)),
                {
                    id: newAppliedVacancy.id,
                    title: newAppliedVacancy.name,
                    company: newAppliedVacancy.company,
                    userId: currentUser.id,
                },
            ];
            window.localStorage.setItem("appliedVacancies", JSON.stringify(updatedApplied));
        }

        setError("");
        alert("Відгук успішно відправлено!");
        navigate("/user");
    };

    if (!vacancy) {
        return <Container>Вакансію не знайдено</Container>;
    }

    return (
        <div className="apply-modal-overlay">
            <div className="apply-modal">
                <Link to="/" className="apply-modal-close">
                    ←
                </Link>
                <h2 className="apply-modal-title">Відгук на вакансію</h2>
                <p className="apply-modal-subtitle">Оберіть спосіб відгуку</p>
                {error ? (
                    <Alert variant="danger" className="apply-modal-error">{error}</Alert>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="apply-modal-group">
                            <Form.Check
                                type="radio"
                                label="Завантаження резюме"
                                name="applyMethod"
                                defaultChecked
                                onClick={() => setSelectedResumeId(null)}
                                className="apply-modal-check"
                            />
                            <Form.Control
                                type="file"
                                accept=".doc,.docx,.txt,.rtf,.pdf"
                                onChange={handleFileChange}
                                className="apply-modal-input"
                            />
                            <Form.Text className="apply-modal-text">
                                Прикріпіть файл розміром до 5 МБ.
                            </Form.Text>
                        </Form.Group>
                        {resumes.length > 0 && (
                            <Form.Group className="apply-modal-group">
                                <Form.Check
                                    type="radio"
                                    label="Вибрати існуюче резюме"
                                    name="applyMethod"
                                    onClick={() => setFile(null)}
                                    className="apply-modal-check"
                                />
                                <Form.Select
                                    value={selectedResumeId || ""}
                                    onChange={(e) => setSelectedResumeId(e.target.value)}
                                    className="apply-modal-select"
                                >
                                    <option value="">Оберіть резюме</option>
                                    {resumes.map((resume) => (
                                        <option key={resume.id} value={resume.id}>
                                            {resume.title || "Без назви"} - {resume.skills}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Form.Group>
                        )}
                        <Button
                            variant="danger"
                            type="submit"
                            className="apply-modal-button"
                        >
                            Продовжити
                        </Button>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default ApplyPage;