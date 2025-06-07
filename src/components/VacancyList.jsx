import React from "react";
import VacancyItemComponent from "./VacancyItemComponent";
import "../styles/App.css";

const VacancyList = ({ vacancies, onApply, onDelete, onHide, role, showModal, setShowModal, dislikeImage }) => {
    return (
        <div className="vacancy-list">
            {vacancies.map((vacancy) => (
                <VacancyItemComponent
                    key={vacancy.id}
                    vacancy={vacancy}
                    onApply={onApply}
                    onDelete={onDelete}
                    onHide={onHide}
                    role={role}
                    showModal={showModal}
                    setShowModal={setShowModal}
                    dislikeImage={dislikeImage}
                />
            ))}
        </div>
    );
};

export default VacancyList;