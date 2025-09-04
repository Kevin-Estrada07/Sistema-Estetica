import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../api/adminAPI";
import Sidebar from "../components/Sidebar";
import Modal from "../components/Modal"; // <-- Importamos
import "../styles/Users.css";

const Users = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleId, setRoleId] = useState(2);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [toast, setToast] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(""), 5000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setFormError(""); setFormSuccess("");

    try {
      await adminAPI.registerUser({ name, email, password, role_id: roleId });
      setFormSuccess("");
      showToast("✅ Usuario registrado correctamente");
      setName(""); setEmail(""); setPassword(""); setRoleId(2);
      fetchUsers();
      setIsModalOpen(false);
    } catch (err) {
      if (err.response?.data?.errors) {
        const messages = Object.values(err.response.data.errors).flat().join(" ");
        setFormError(messages);
      } else {
        setFormError(err.message);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminAPI.deleteUser(id);
      showToast("✅ Usuario eliminado");
      fetchUsers();
    } catch {
      alert("Error al eliminar usuario");
    }
  };

  return (
    <div className="dashboard">
      <Sidebar />

      <main className="users-content">
        <header className="users-header">
          <h1>👥 Usuarios Registrados</h1>
          <button className="btn-register" onClick={() => setIsModalOpen(true)}>➕ Registrar</button>
        </header>

        {loading ? <p className="loading">Cargando...</p> :
          error ? <p className="error">{error}</p> :
            <div className="table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.role?.name}</td>
                      <td>
                        <button className="btn-delete" onClick={() => setConfirmDelete(u)}>🗑 Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }

        {/* Modal Registrar Usuario */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="✍ Registrar Usuario">
          {formError && <p className="alert error">{formError}</p>}
          {formSuccess && <p className="alert success">{formSuccess}</p>}
          <form onSubmit={handleRegister} className="form-user">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required/>
            </div>

            <div className="form-group">
              <label>Correo</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required/>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required/>
            </div>

            <div className="form-group">
              <label>Rol</label>
              <select
                value={roleId}
                onChange={(e) => setRoleId(Number(e.target.value))}>
                <option value={2}>Recepcionista</option>
                <option value={3}>Estilista</option>
              </select>
            </div>

            <button type="submit" className="btn-submit">Registrar</button>
          </form>

        </Modal>

        {/* Modal Confirm Delete */}
        <Modal
          isOpen={confirmDelete !== null}
          onClose={() => setConfirmDelete(null)}
          title={`¿Eliminar usuario ${confirmDelete?.name}?`}
          hideCloseButton={true} // Oculta el botón de cerrar automático
          actions={
            <>
              <button className="btn-confirm" onClick={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}>Sí</button>
              <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>No</button>
            </>
          }
        />

      </main>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export default Users;
