import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";
import NavBar from "../components/NavBar";

const TRAINING_DATA = {
  "Fly yoga": {
    description: "Тренировка в гамаках, направленная на растяжку, расслабление и снятие напряжения. Помогает улучшить гибкость, разгрузить позвоночник и восстановить тело после нагрузок.",
    image: "/images/fly.webp"
  },
  "Aero stretching": {
    description: "Глубокая растяжка с использованием специальных полотен для безопасного и эффективного увеличения гибкости. Подходит для любого уровня подготовки и помогает расслабить мышцы.",
    image: "/images/aero.webp"
  },
  "Stretching": {
    description: "Классическая тренировка на развитие гибкости и подвижности суставов. Помогает улучшить осанку, снять зажимы и повысить общее самочувствие.",
    image: "/images/stretch.webp"
  },
  "Силовая": {
    description: "Интенсивная тренировка для укрепления мышц и развития силы. Включает упражнения на всё тело и помогает повысить выносливость и тонус.",
    image: "/images/power.webp"
  },
  "МФР + здоровая спина": {
    description: "Комплекс упражнений с элементами миофасциального релиза для восстановления мышц и улучшения состояния спины. Снимает напряжение, улучшает кровообращение и помогает избавиться от дискомфорта.",
    image: "/images/back.webp"
  },
  "Пилатес": {
    description: "Спокойная и эффективная тренировка для укрепления глубоких мышц и улучшения осанки. Помогает развить контроль над телом, баланс и общее самочувствие.",
    image: "/images/pilates.webp"
  }
};


function Home() {
  const navigate = useNavigate();
  const user = getUser();

  const checkAuth = (path) => {
    if (!user) navigate("/login");
    else navigate(path);
  };

  return (
    <>
      <NavBar title="" />
      <h1 className="text">FitBody</h1>
      <div className="container">

        <div className="top-buttons">
          <div
            className="top-btn"
            onClick={() => checkAuth("/individual")}
          >
            Индивидуальные услуги
          </div>

          <div
            className="top-btn"
            onClick={() => checkAuth("/schedule")}
          >
            Групповые события
          </div>
        </div>

        <div className="section-title">
          НАШИ НАПРАВЛЕНИЯ
        </div>

        <div className="cards">
          {Object.entries(TRAINING_DATA).map(([title, data]) => (
            <div key={title} className="card">

              <img src={data.image} alt="" />

              <div className="card-content">
                <h2 className="title-pink">{title}</h2>

                <p className="desc">
                  {data.description}
                </p>
              </div>

            </div>
          ))}
        </div>

      </div>
    </>
  );
}

export default Home;