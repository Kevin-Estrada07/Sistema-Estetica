import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { productsAPI } from "../api/productsAPI";
import { useAuth } from "../context/AuthContext";
import "../styles/Product.css"
import Modal from "../components/Modal";

const Products = () => {
    const { user } = useAuth();
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editProduct, setEditProduct] = useState(null);
    const [confirmDelete, setConfirmDelete] = useState(null);

    const [nombre, setName] = useState("");
    const [descripcion, setDescription] = useState("");
    const [cantidad, setQuantity] = useState("");
    const [precioUnitario, setUnitPrice] = useState("");
    const [toast, setToast] = useState("");

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredProducts(products);
        } else {
            const lower = search.toLowerCase();
            setFilteredProducts(
                products.filter(p =>
                    p.nombre.toLowerCase().includes(lower)
                )
            );
        }
    }, [search, products]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await productsAPI.getAll();
            setProducts(res.data);
            setFilteredProducts(res.data);
        } catch {
            setError("Error al cargar productos");
        } finally {
            setLoading(false);
        }
    };

    const showToast = (message) => {
        setToast(message);
        const timer = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(timer);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const nameExists = products.some(
            p => p.nombre?.toLowerCase() === nombre.toLowerCase() && (!editProduct || p.id !== editProduct.id)
        );

        if (nameExists) {
            showToast("❌ Este Producto ya está registrado");
            return;
        }

        try {
            if (editProduct) {
                await productsAPI.update(editProduct.id, { nombre, descripcion, cantidad, precio_unitario: precioUnitario });
                showToast("✅ Producto actualizado");
            } else {
                await productsAPI.create({ nombre, descripcion, cantidad, precio_unitario: precioUnitario });
                showToast("✅ Producto registrado");
            }
            fetchProducts();
            closeModal();
        } catch {
            showToast("❌ Error al crear el producto");
        }
    };

    const handleDelete = async (id) => {
        try {
            await productsAPI.delete(id);
            showToast("✅ Producto eliminado");
            fetchProducts();
        } catch {
            showToast("❌ Error al eliminar producto");
        }
    };

    const openEditModal = (product) => {
        setEditProduct(product);
        setName(product.nombre);
        setDescription(product.descripcion || "");
        setQuantity(product.cantidad || "");
        setUnitPrice(product.precio_unitario || "");
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditProduct(null);
        setName(""); setDescription(""); setQuantity(""); setUnitPrice("");
    };

    return (
        <div className="dashboard">
            <Sidebar />

            <main className="products-content">
                <header className="products-header">
                    <h1>📦 Productos</h1>
                    <div className="products-actions">
                        <input
                            type="text"
                            placeholder="🔍 Buscar producto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="search-input"
                        />
                        <button className="btn-register" onClick={() => setIsModalOpen(true)}>
                            ➕ Nuevo Producto
                        </button>
                    </div>
                </header>

                {loading ? <p>Cargando...</p> : error ? <p>{error}</p> :
                    <div className="table-wrapper">
                        <table className="products-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Nombre</th>
                                    <th>Descripción</th>
                                    <th>Cantidad</th>
                                    <th>Precio Unitario</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map(p => (
                                    <tr key={p.id}>
                                        <td>{p.id}</td>
                                        <td>{p.nombre}</td>
                                        <td>{p.descripcion}</td>
                                        <td>{p.cantidad}</td>
                                        <td>{p.precio_unitario}</td>
                                        <td>
                                            <button className="btn-edit" onClick={() => openEditModal(p)}>✏️ Editar</button>
                                            <button className="btn-delete" onClick={() => setConfirmDelete(p)}>🗑 Eliminar</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                }

                {/* Modal Registro / Edición */}
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    title={editProduct ? "✍ Editar Producto" : "✍ Nuevo Producto"}>
                    <form onSubmit={handleSubmit} className="form-client">
                        <div className="form-group">
                            <label>Nombre</label>
                            <input
                                type="text"
                                value={nombre}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Descripción</label>
                            <textarea
                                value={descripcion}
                                onChange={e => setDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Cantidad</label>
                            <input
                                type="number"
                                value={cantidad}
                                onChange={e => setQuantity(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Precio Unitario</label>
                            <input
                                type="number"
                                value={precioUnitario}
                                onChange={e => setUnitPrice(e.target.value)}
                                required/>
                        </div>

                        <button type="submit" className="btn-submit">
                            {editProduct ? "Actualizar" : "Registrar"}
                        </button>
                    </form>
                </Modal>

                {/* Modal Confirmación Eliminación */}
                <Modal
                    isOpen={confirmDelete !== null}
                    onClose={() => setConfirmDelete(null)}
                    title={confirmDelete ? `¿Eliminar producto ${confirmDelete.nombre}?` : ""}
                    hideCloseButton={true}
                    actions={
                        <>
                            <button className="btn-confirm" onClick={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}>Sí</button>
                            <button className="btn-cancel" onClick={() => setConfirmDelete(null)}>No</button>
                        </>
                    }
                />

                {toast && <div className="toast">{toast}</div>}
            </main>
        </div>
    );
};

export default Products;
