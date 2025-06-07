import React from "react";
import { Form, Button } from "react-bootstrap";
import "../styles/App.css";

const VacancyForm = ({
                         name,
                         company,
                         image,
                         salary,
                         location,
                         description,
                         onNameChange,
                         onCompanyChange,
                         onImageChange,
                         onSalaryChange,
                         onLocationChange,
                         onDescriptionChange,
                         onSubmit,
                     }) => {
    return (
        <Form onSubmit={onSubmit} className="mb-4">
            <Form.Group className="mb-2">
                <Form.Control
                    type="text"
                    placeholder="Назва вакансії"
                    value={name}
                    onChange={onNameChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    type="text"
                    placeholder="Компанія"
                    value={company}
                    onChange={onCompanyChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    type="text"
                    placeholder="URL зображення (необов’язково)"
                    value={image}
                    onChange={onImageChange}
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    type="number"
                    placeholder="Зарплата (грн)"
                    value={salary}
                    onChange={onSalaryChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    type="text"
                    placeholder="Місто"
                    value={location}
                    onChange={onLocationChange}
                    required
                />
            </Form.Group>
            <Form.Group className="mb-2">
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Опис вакансії"
                    value={description}
                    onChange={onDescriptionChange}
                    required
                />
            </Form.Group>
            <Button className="btn-add-vacancy" type="submit">
                Додати вакансію
            </Button>
        </Form>
    );
};

export default VacancyForm;