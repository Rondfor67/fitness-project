import { useNavigate } from "react-router-dom";
import { getUser } from "../services/auth";

function NavBar({ title }) {
  const navigate = useNavigate();
  const user = getUser();

  return (
    <div className="top-bar">

      <div className="left">
        <div className="logo" onClick={() => navigate("/studio")}>
        <img src="/logo.webp" alt="logo" />
      </div>

        <div className="nav">
          <span onClick={() => navigate("/")}>Главная</span>
          <span onClick={() => navigate("/studio")}>О нас</span>
        </div>
      </div>

      <div className="title">{title}</div>

     <img
      src="/avatar.webp"
      className="avatar"
      onClick={() => {
        if (!user) navigate("/login");
        else navigate("/profile");
      }}
    />
    </div>
  );
}

export default NavBar;