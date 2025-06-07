import React, { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { LOCALSTORE_VACANCIES } from "../models/constants";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/App.css";

const AppliedVacanciesPage = () => {
    const [appliedVacancies, setAppliedVacancies] = useState([]);

    const getLocalStore = () => {
        const storedVacancies = window.localStorage.getItem(LOCALSTORE_VACANCIES);
        if (storedVacancies) {
            const parsedVacancies = JSON.parse(storedVacancies);
            if (Array.isArray(parsedVacancies)) {
                const applied = parsedVacancies.filter((v) => v.applied);
                setAppliedVacancies(applied);
            }
        }
    };

    useEffect(() => {
        getLocalStore();
    }, []);

    return (
        <Container className="work-container">
            <h2>Відгукнуті вакансії</h2>
            <Link to="/" className="btn btn-primary mb-3">
                Повернутися до списку вакансій
            </Link>
            <div className="vacancy-list">
                {appliedVacancies.length > 0 ? (
                    appliedVacancies.map((vacancy) => (
                        <div key={vacancy.id} className="vacancy-tile">
                            <div className="tile-left">
                                <img src={vacancy.image} alt="logo" className="vacancy-logo" />
                                <div>
                                    <h5>{vacancy.name}</h5>
                                    <div>{vacancy.company}</div>
                                    <div className="salary">{vacancy.salary.toLocaleString()} грн</div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div>Немає відгукнутих вакансій</div>
                )}
            </div>
        </Container>
    );
};

export default AppliedVacanciesPage;