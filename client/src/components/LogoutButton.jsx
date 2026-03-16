import { useNavigate } from "react-router-dom";

export default function LogoutButton() {
  const navigate = useNavigate();

  function handleClick() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  return <button onClick={handleClick}>Logout</button>;
}
