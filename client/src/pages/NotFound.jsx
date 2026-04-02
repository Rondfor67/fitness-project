import { useNavigate } from "react-router-dom";

function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound">
      <div className="overlay">
        <h1>404</h1>
        <p>Ой… ты забрёл не туда 👀</p>

        <button onClick={() => navigate("/")}>
          На главную
        </button>
      </div>
    </div>
  );
}

export default NotFound;