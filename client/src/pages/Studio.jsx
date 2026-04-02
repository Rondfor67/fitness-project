import { useNavigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../components/NavBar";

function Studio() {
  const navigate = useNavigate();

  const images = [
    "/studio/studio1.webp",
    "/studio/studio2.webp",
    "/studio/studio3.webp",
    "/studio/studio4.webp"
  ];

  const trainers = [
    {
      name: "Алина",
      desc: "Бережный подход к каждому",
      img: "/trainers/alina.webp"
    },
    {
      name: "Элона",
      desc: "Функциональные тренировки",
      img: "/trainers/elona.webp"
    },
    {
      name: "Роман",
      desc: "Силовые тренировки и расслабление",
      img: "/trainers/roman.webp"
    },
    {
      name: "Амина",
      desc: "Гибкость, восстановление и сила",
      img: "/trainers/amina.webp"
    },
    {
      name: "Ербол",
      desc: "Выносливость и ловкость",
      img: "/trainers/erbol.webp"
    },
    {
      name: "Алия",
      desc: "Здоровье спины, индивидуальный подход к каждому",
      img: "/trainers/aliya.webp"
    }
  ];

  const [trainerIndex, setTrainerIndex] = useState(0);

  return (
    <>
      <NavBar title="" />
      <h1 className="text">FitBody</h1>

      <div className="container">

        <h3 className="studio-title">АДРЕС</h3>
        <p className="studio-text">
          Мангилик Ел проспект 27/1 <br />
          Ждем вас в это время: 7:00–23:15
        </p>

        <h3 className="studio-title">КОНТАКТЫ</h3>
        <p className="studio-text">Телефон: +7 777 333 22 11</p>
        <p className="studio-text">Почта: fitonyashka@mail.ru</p>


        <h3 className="studio-title">ОБЗОР</h3>

        <div className="studio-grid">
          {images.map((img, i) => (
            <img key={i} src={img} className="studio-img" />
          ))}
        </div>

        <h3 className="studio-title">НАШИ ТРЕНЕРЫ</h3>

        <div className="carousel">
          <button
            className="arrow"
            onClick={() =>
              setTrainerIndex(
                trainerIndex === 0
                  ? trainers.length - 1
                  : trainerIndex - 1
              )
            }
          >
            ‹
          </button>

          <div className="trainer-big">
            <img
              src={trainers[trainerIndex].img}
              className="trainer-img"
            />
            <h3>{trainers[trainerIndex].name}</h3>
            <p>{trainers[trainerIndex].desc}</p>
          </div>

          <button
            className="arrow"
            onClick={() =>
              setTrainerIndex(
                (trainerIndex + 1) % trainers.length
              )
            }
          >
            ›
          </button>
        </div>

      </div>
    </>
  );
}

export default Studio;