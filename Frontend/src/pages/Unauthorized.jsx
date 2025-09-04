import Sidebar from "../components/Sidebar";

const Unauthorized = () => (
    <div className="dashboard">
        <Sidebar />
        <main className="users-content">
            <div className="unauthorized">
                <h2>🚫 No tienes autorización</h2>
                <p>Contacta al administrador si crees que es un error.</p>
            </div>
        </main>
    </div>

);

export default Unauthorized;
