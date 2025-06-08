import React, { useState } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { LOCALSTORE_USERS, LOCALSTORE_CURRENT_USER } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";

const RegisterPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError("Будь ласка, заповніть усі поля.");
            return;
        }

        const users = JSON.parse(window.localStorage.getItem(LOCALSTORE_USERS)) || [];
        const existingUser = users.find((u) => u.email === email);
        if (existingUser) {
            setError("Користувач з таким email вже існує.");
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
        };

        users.push(newUser);
        window.localStorage.setItem(LOCALSTORE_USERS, JSON.stringify(users));
        window.localStorage.setItem(LOCALSTORE_CURRENT_USER, JSON.stringify(newUser));
        setError("");
        navigate(role === "admin" ? "/admin" : "/user");
    };

    return (
        <Container fluid className="work-container">
            <header className="header-main">
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

            <Container className="max-w-4xl mx-auto p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Реєстрація</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Ім'я</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Введіть ваше ім'я"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            placeholder="Введіть ваш email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            placeholder="Введіть пароль"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Тип користувача</Form.Label>
                        <Form.Select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">Користувач</option>
                            <option value="admin">Компанія (адміністратор)</option>
                        </Form.Select>
                    </Form.Group>
                    <div className="d-flex gap-3 flex-wrap">
                        <Button variant="primary" type="submit">
                            Зареєструватися
                        </Button>
                        <Link to="/login" className="btn btn-secondary">
                            Вже є акаунт? Увійти
                        </Link>
                    </div>
                </Form>
            </Container>
        </Container>
    );
};

export default RegisterPage;