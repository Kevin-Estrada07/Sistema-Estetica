import React, { useState } from 'react';
import axios from 'axios';

const Conexion = () => {
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);

  const probarConexion = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/conexion');
      setMensaje(`✅ ${res.data.message}`);
    } catch (error) {
      setMensaje('❌ Error al conectar con el backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{textAlign: 'center', padding: '2rem'}}>
      <h1>Prueba de Conexión</h1>
      <button 
        onClick={probarConexion} 
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: '#d47ea2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
        {loading ? 'Conectando...' : 'Probar conexión'}
      </button>
      {mensaje && <p style={{marginTop: '20px', fontSize: '18px'}}>{mensaje}</p>}
    </div>
  );
};

export default Conexion;
 