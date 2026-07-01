import { useState, useEffect } from 'react';
import API from './api';

function App() {
  // --- ESTADOS DE CONTROL DE PANTALLA Y SESIÓN ---
  const [pantallaActual, setPantallaActual] = useState('login'); // 'login', 'registro', 'dashboard'
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [roles, setRoles] = useState(JSON.parse(localStorage.getItem('roles')) || []);
  const [usuarioLogueado, setUsuarioLogueado] = useState(localStorage.getItem('username') || '');

  // --- ESTADOS PARA FORMULARIOS ---
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // --- NUEVOS ESTADOS PARA CREAR PRODUCTO (SELLER) ---
  const [nombreProducto, setNombreProducto] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [precioProducto, setPrecioProducto] = useState('');
  const [categoriaProducto, setCategoriaProducto] = useState('');

  // --- ESTADOS PARA EL BUSCADOR DE SUBASTAS ---
  const [nombre, setNombre] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [subastas, setSubastas] = useState([]);

  // --- AL ARRANCAR: Si ya hay token, vamos directo al Dashboard ---
  useEffect(() => {
    if (token) {
      setPantallaActual('dashboard');
      const cargarSubastasIniciales = async () => {
        try {
          const response = await API.get('/subastas');
          setSubastas(response.data);
        } catch (error) {
          console.error("Error al cargar subastas iniciales:", error);
        }
      };
      cargarSubastasIniciales();
    }
  }, [token]);

  const manejarLogin = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await API.post('/auth/login', {
        email: emailInput,
        password: passwordInput
      });

      const token = respuesta.data;
      localStorage.setItem("token", token);

      // NOTA: Guardamos también el correo ingresado para mostrarlo en el header
      localStorage.setItem("username", emailInput);
      setUsuarioLogueado(emailInput);

      alert("¡Inicio de sesión correcto!");
      setPantallaActual('dashboard');
    } catch (error) {
      console.error(error);
      alert("Credenciales incorrectas o error en el servidor.");
    }
  };

  const manejarRegistro = async (e) => {
    e.preventDefault();
    try {
      await API.post('/auth/register', {
        name: usernameInput,
        email: emailInput,
        password: passwordInput
      });

      alert("¡Usuario registrado con éxito!");
      setPantallaActual('login');
    } catch (error) {
      console.error(error);
      alert("No se pudo completar el registro.");
    }
  };

  // --- LÓGICA: AUTO-ASIGNARSE ROL SELLER ---
  const convertirseEnVendedor = async () => {
    try {
      await API.post('/users/seller', {});

      const nuevosRoles = [...roles, 'SELLER'];
      localStorage.setItem('roles', JSON.stringify(nuevosRoles));
      setRoles(nuevosRoles);
      alert("¡Felicidades! Ahora tenés el rol SELLER asignado.");
    } catch (error) {
      console.error(error);
      alert("No se pudo procesar la asignación de rol.");
    }
  };

  // --- NUEVA LÓGICA: CREAR PRODUCTO (SOLO ACCESIBLE PARA SELLER) ---
  const manejarCrearProducto = async (e) => {
    e.preventDefault();
    try {
      // Mandamos los atributos tal cual los espera tu entidad Producto en Java
      const respuesta = await API.post('/productos', {
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        precioBase: parseFloat(precioProducto), // Lo parseamos a número
        categoria: categoriaProducto || null
      });

      alert(`¡Producto "${respuesta.data.nombre}" creado exitosamente!`);

      // Limpiamos los inputs del formulario de creación
      setNombreProducto('');
      setDescripcionProducto('');
      setPrecioProducto('');
      setCategoriaProducto('');

      // Opcional: Podrías volver a consultar el buscador para ver si se listó
    } catch (error) {
      console.error(error);
      alert("No se pudo crear el producto. Verificá los permisos o la consola.");
    }
  };

  // --- LÓGICA: CERRAR SESIÓN ---
  const cerrarSesion = () => {
    localStorage.clear();
    setToken('');
    setRoles([]);
    setUsuarioLogueado('');
    setPantallaActual('login');
  };

  // --- LÓGICA: BUSCADOR FILTRADO ---
  const manejarBusqueda = async () => {
    try {
      const response = await API.get('/subastas', {
        params: {
          nombre: nombre || null,
          precioMin: precioMin || null,
          precioMax: precioMax || null
        }
      });
      setSubastas(response.data);
    } catch (error) {
      console.error(error);
      alert("Error al filtrar las subastas.");
    }
  };

  // --- LÓGICA: DAR LIKE ---
  const darLike = async (subastaId) => {
    try {
      await API.post(`/subastas/${subastaId}/like`);
      alert("❤️ ¡Like registrado! Te enviaremos una notificación 1 hora antes.");
    } catch (error) {
      console.error(error);
      alert("Para interactuar debés estar autenticado.");
    }
  };

  // ==========================================
  // PANTALLAS (Renderizado Condicional)
  // ==========================================

  if (pantallaActual === 'login') {
    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '50px auto', fontFamily: 'Segoe UI', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>🔨 Iniciar Sesión</h2>
          <form onSubmit={manejarLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder="Correo Electrónico" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="password" placeholder="Contraseña" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Ingresar</button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            ¿No tenés cuenta? <span onClick={() => setPantallaActual('registro')} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Registrate acá</span>
          </p>
        </div>
    );
  }

  if (pantallaActual === 'registro') {
    return (
        <div style={{ padding: '50px', maxWidth: '400px', margin: '50px auto', fontFamily: 'Segoe UI', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 Registro de Usuario</h2>
          <form onSubmit={manejarRegistro} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder="Elige un Usuario" value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="email" placeholder="Correo Electrónico" value={emailInput} onChange={(e) => setEmailInput(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <input type="password" placeholder="Contraseña" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }} required />
            <button type="submit" style={{ padding: '10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Cuenta</button>
          </form>
          <p style={{ marginTop: '20px', textAlign: 'center' }}>
            ¿Ya tenés cuenta? <span onClick={() => setPantallaActual('login')} style={{ color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}>Inicia sesión</span>
          </p>
        </div>
    );
  }

  return (
      <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eee', paddingBottom: '15px', marginBottom: '20px' }}>
          <div>
            <h1>🔨 Subastas Online</h1>
            <p>Bienvenido, <b>{usuarioLogueado}</b> | Roles: <span style={{ color: '#555' }}>{roles.join(', ')}</span></p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {!roles.includes('SELLER') && (
                <button onClick={convertirseEnVendedor} style={{ padding: '8px 15px', background: '#ffc107', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  🚀 Convertirme en Vendedor
                </button>
            )}
            <button onClick={cerrarSesion} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* --- NUEVO BLOQUE: FORMULARIO SOLO VISIBLE PARA VENDEDORES (SELLER) --- */}
        {roles.includes('SELLER') && (
            <div style={{ marginBottom: '30px', background: '#e9f7ef', padding: '20px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <h3 style={{ marginTop: 0, color: '#155724' }}>📦 Panel de Vendedor: Publicar Producto Nuevo</h3>
              <form onSubmit={manejarCrearProducto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="Nombre del producto" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} required />
                <input type="text" placeholder="Descripción..." value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '2' }} required />
                <input type="number" step="0.01" placeholder="Precio Base ($)" value={precioProducto} onChange={(e) => setPrecioProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '130px' }} required />
                <input type="text" placeholder="Categoría (Opcional)" value={categoriaProducto} onChange={(e) => setCategoriaProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '150px' }} />
                <button type="submit" style={{ padding: '8px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Publicar</button>
              </form>
            </div>
        )}

        <div style={{ marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>🔍 Filtrar Subastas</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Buscar por nombre..." value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
            <input type="number" placeholder="Precio Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }} />
            <input type="number" placeholder="Precio Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }} />
            <button onClick={manejarBusqueda} style={{ padding: '8px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Buscar</button>
          </div>
        </div>

        <h3>Subastas Disponibles</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {subastas.length === 0 ? (
              <p style={{ color: '#666' }}>No hay subastas para mostrar.</p>
          ) : (
              subastas.map((subasta) => (
                  <div key={subasta.id} style={{ border: '1px solid #e0e0e0', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{subasta.producto?.nombre}</h4>
                    <p style={{ color: '#555', fontSize: '14px' }}>{subasta.producto?.descripcion}</p>
                    <p><b>Precio Actual:</b> ${subasta.precioBase}</p>
                    <p><b>Estado:</b> <span style={{ color: subasta.estado === 'ACTIVA' ? 'green' : 'orange', fontWeight: 'bold' }}>{subasta.estado}</span></p>

                    {subasta.estado === 'PUBLICADA' && (
                        <button onClick={() => darLike(subasta.id)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '15px' }}>
                          ❤️ Recordar Subasta
                        </button>
                    )}
                  </div>
              ))
          )}
        </div>
      </div>
  );
}

export default App;