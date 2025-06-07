import React, { useEffect } from "react";

const VacancyStatus = ({ name, applied }) => {
    useEffect(() => {
        console.log(`Компонент для вакансії ${name} змонтовано (componentDidMount)`);
    });

    useEffect(() => {
        console.log(`Це спрацює один раз перед розмонтуванням (componentWillUnmount)`);
        return () => {
            console.log(`Компонент для вакансії ${name} розмонтовано`);
        };
    }, []);

    useEffect(() => {
        console.log(`Статус applied для ${name} змінився: ${applied} (componentDidUpdate)`);
    }, [applied]);

    return null;
};

export default VacancyStatus;