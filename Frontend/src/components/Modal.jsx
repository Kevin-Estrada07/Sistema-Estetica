// components/Modal.jsx
import React from "react";
import "../styles/Modal.css";

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  actions, 
  hideCloseButton = false, 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        
        {/* Header del modal */}
        {title && (
          <div className="modal-header">
            <h2>{title}</h2>
            {!hideCloseButton && (
              <button className="modal-close" onClick={onClose}>
                ✖
              </button>
            )}
          </div>
        )}

        {/* Cuerpo del modal */}
        <div className="modal-body">
          {children}
        </div>

        {/* Acciones */}
        <div className="modal-footer">
          {actions ? (
            <div className="modal-actions">{actions}</div>
          ) : (
            <>
              {/* <button className="btn-attend" onClick={onAttend}>
                ✅ Atender
              </button> */}
              {/* <button className="btn-cancel" onClick={onClose}>
                ❌ Cerrar
              </button> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
