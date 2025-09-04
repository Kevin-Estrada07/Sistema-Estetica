// components/Modal.jsx
import React from "react";
import "../styles/Modal.css"; // Asegúrate de tener estilos comunes para todos los modales

const Modal = ({ isOpen, onClose, title, children, actions, hideCloseButton = false }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                {title && <h2>{title}</h2>}
                <div className="modal-body">{children}</div>
                {actions && <div className="modal-actions">{actions}</div>}
                {!hideCloseButton && <button className="btn-close" onClick={onClose}>⬅ Cancelar</button>}
            </div>
        </div>
    );
};


export default Modal;
