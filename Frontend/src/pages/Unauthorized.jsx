import Sidebar from "../components/Sidebar";
import "../styles/unauthorized.css";

const Unauthorized = () => (
    <div className="dashboard">
        <Sidebar />
        <main className="users-content">
            <div className="unauthorized-container">
                <div className="unauthorized-card">
                    <h1>🚫 Acceso denegado</h1>
                    <p>No tienes autorización para ver esta sección.</p>
                    <p>Si crees que es un error, contacta al administrador.</p>
                    <button onClick={() => window.location.href = "/dashboard"} className="btn-home">
                        Ir al inicio
                    </button>
                </div>
            </div>
        </main>
    </div>
);

export default Unauthorized;
