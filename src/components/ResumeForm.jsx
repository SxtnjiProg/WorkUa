// src/components/ResumeForm.jsx
import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";

const ResumeForm = ({ onSubmit, initialData = {} }) => {
    const [title, setTitle] = useState(initialData.title || "");
    const [skills, setSkills] = useState(initialData.skills || "");
    const [experience, setExperience] = useState(initialData.experience || "");
    const [education, setEducation] = useState(initialData.education || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!title || !skills) return;
        onSubmit({
            title,
            skills,
            experience,
            education,
        });
    };

    return (
        <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-2">
                <Form.Control
                    type="text"
                    placeholder="Назва резюме (наприклад, Frontend Developer)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Навички (наприклад, React, JavaScript, CSS)"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Досвід роботи (необов’язково)"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Освіта (необов’язково)"
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                />
            </Form.Group>
            <Button variant="primary" type="submit">
                Зберегти резюме
            </Button>
        </Form>
    );
};

export default ResumeForm;