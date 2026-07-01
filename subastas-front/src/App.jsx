import { useState, useEffect } from 'react';
import API from './api';

function App() {
  // --- FUNCION: DECODIFICAR EL JWT PARA SACAR LOS ROLES ---
  const decodificarJWT = (token) => {
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return {};
    }
  };

  // --- ESTADOS DE CONTROL DE PANTALLA Y SESIÓN ---
  const [pantallaActual, setPantallaActual] = useState(localStorage.getItem('token') ? 'dashboard' : 'login'); // 'login', 'registro', 'dashboard'
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [roles, setRoles] = useState(() => {
    const rolesGuardados = JSON.parse(localStorage.getItem('roles') || 'null');
    if (rolesGuardados) return rolesGuardados;
    // Si hay token pero no roles guardados (ej. dato viejo en localStorage), los sacamos del JWT
    const tokenGuardado = localStorage.getItem('token');
    return tokenGuardado ? (decodificarJWT(tokenGuardado).roles || []) : [];
  });
  const [usuarioLogueado, setUsuarioLogueado] = useState(localStorage.getItem('username') || '');

  // --- ESTADOS PARA FORMULARIOS ---
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');

  // --- NUEVOS ESTADOS PARA CREAR PRODUCTO (SELLER) ---
  const [nombreProducto, setNombreProducto] = useState('');
  const [descripcionProducto, setDescripcionProducto] = useState('');
  const [categoriaProducto, setCategoriaProducto] = useState('');

  // --- ESTADOS PARA EL BUSCADOR DE SUBASTAS ---
  const [nombre, setNombre] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [subastas, setSubastas] = useState([]);

  // --- ESTADO PARA LAS CATEGORIAS DEL FILTRO (tarea 1) ---
  const [categorias, setCategorias] = useState([]);

  // --- ESTADO PARA LOS PRODUCTOS (select en Crear Subasta) ---
  const [productos, setProductos] = useState([]);

  // --- ESTADO PARA MIS SUBASTAS COMO VENDEDOR (todas, sin importar el estado — viene de GET /subastas/mias) ---
  const [misSubastas, setMisSubastas] = useState([]);

  // --- ESTADOS PARA CREAR SUBASTA (tarea 2) ---
  const [productoIdSubasta, setProductoIdSubasta] = useState('');
  const [precioBaseSubasta, setPrecioBaseSubasta] = useState('');
  const [incrementoMinimoSubasta, setIncrementoMinimoSubasta] = useState('');
  const [fechaInicioSubasta, setFechaInicioSubasta] = useState('');
  const [fechaCierreSubasta, setFechaCierreSubasta] = useState('');

  // --- ESTADO PARA EL DETALLE DE SUBASTA (tareas 4 y 5) ---
  const [subastaSeleccionada, setSubastaSeleccionada] = useState(null);
  const [montoPuja, setMontoPuja] = useState('');
  const [pujas, setPujas] = useState([]);

  // --- ESTADO PARA MIS LIKES (tarea 6) ---
  const [misLikes, setMisLikes] = useState(new Set());

  // --- ESTADOS PARA EL PANEL ADMIN (tarea 8) ---
  const [emailAdmin, setEmailAdmin] = useState('');
  const [nombreCategoriaNueva, setNombreCategoriaNueva] = useState('');

  // --- ESTADOS PARA DISPUTAS ---
  const [motivoDisputa, setMotivoDisputa] = useState('');
  const [descripcionDisputa, setDescripcionDisputa] = useState('');
  const [idDisputa, setIdDisputa] = useState('');
  const [categoriaResolucion, setCategoriaResolucion] = useState('');
  const [disputasPendientes, setDisputasPendientes] = useState([]);

  // --- ESTADO PARA NOTIFICACIONES ---
  const [notificaciones, setNotificaciones] = useState([]);

  // --- ESTADO PARA MIS PUJAS EN LA SUBASTA SELECCIONADA ---
  const [misPujas, setMisPujas] = useState([]);

  // --- ESTADO PARA ASIGNAR ROL ADMIN ---
  const [emailAdminAsignar, setEmailAdminAsignar] = useState('');

  // --- ESTADOS PARA EDITAR CATEGORIA ---
  const [categoriaEditandoId, setCategoriaEditandoId] = useState(null);
  const [nombreCategoriaEditado, setNombreCategoriaEditado] = useState('');

  // --- AL ARRANCAR: Si ya hay token, vamos directo al Dashboard ---
  useEffect(() => {
    if (token) {
      const cargarSubastasIniciales = async () => {
        try {
          const response = await API.get('/subastas');
          setSubastas(response.data);
        } catch (error) {
          console.error("Error al cargar subastas iniciales:", error);
        }
      };
      cargarSubastasIniciales();

      const cargarCategorias = async () => {
        try {
          const response = await API.get('/categorias');
          setCategorias(response.data);
        } catch (error) {
          console.error("Error al cargar categorias:", error);
        }
      };
      cargarCategorias();

      const cargarProductos = async () => {
        try {
          const response = await API.get('/productos');
          setProductos(response.data);
        } catch (error) {
          console.error("Error al cargar productos:", error);
        }
      };
      cargarProductos();

      if (roles.includes('SELLER')) {
        const cargarMisSubastas = async () => {
          try {
            const response = await API.get('/subastas/mias');
            setMisSubastas(response.data);
          } catch (error) {
            console.error("Error al cargar mis subastas:", error);
          }
        };
        cargarMisSubastas();
      }

      const cargarNotificaciones = async () => {
        try {
          const response = await API.get('/notificaciones/mias');
          setNotificaciones(response.data);
        } catch (error) {
          console.error("Error al cargar notificaciones:", error);
        }
      };
      cargarNotificaciones();

      if (roles.includes('ADMIN')) {
        const cargarDisputasPendientes = async () => {
          try {
            const response = await API.get('/subastas/disputas/pendientes');
            setDisputasPendientes(response.data);
          } catch (error) {
            console.error("Error al cargar disputas pendientes:", error);
          }
        };
        cargarDisputasPendientes();
      }

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

      // Decodificamos el JWT para sacar los roles del claim "roles"
      const payload = decodificarJWT(token);
      const rolesExtraidos = payload.roles || [];
      localStorage.setItem('roles', JSON.stringify(rolesExtraidos));
      setRoles(rolesExtraidos);

      // NOTA: Guardamos también el correo ingresado para mostrarlo en el header
      localStorage.setItem("username", emailInput);
      setUsuarioLogueado(emailInput);

      alert("¡Inicio de sesión correcto!");
      setToken(token);
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
      // (categoria es obligatoria y es una relación, mandamos el id de la categoría elegida)
      const respuesta = await API.post('/productos', {
        nombre: nombreProducto,
        descripcion: descripcionProducto,
        categoria: { id: parseInt(categoriaProducto) }
      });

      alert(`¡Producto "${respuesta.data.nombre}" creado exitosamente!`);

      // Limpiamos los inputs del formulario de creación
      setNombreProducto('');
      setDescripcionProducto('');
      setCategoriaProducto('');

      // Refrescamos la lista de productos para que aparezca en el select de Crear Subasta
      const productosActualizados = await API.get('/productos');
      setProductos(productosActualizados.data);

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
          precioMax: precioMax || null,
          categoriaId: categoriaId || null
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
      await API.post(`/subastas/${subastaId}/likes`);
      setMisLikes(prev => new Set([...prev, subastaId]));
      alert("❤️ ¡Like registrado! Te enviaremos una notificación 1 hora antes.");
    } catch (error) {
      console.error(error);
      alert("Para interactuar debés estar autenticado.");
    }
  };

  // --- LÓGICA: QUITAR LIKE (tarea 6) ---
  const quitarLike = async (subastaId) => {
    try {
      await API.delete(`/subastas/${subastaId}/likes`);
      setMisLikes(prev => {
        const s = new Set(prev);
        s.delete(subastaId);
        return s;
      });
      alert("💔 Le sacaste el like a esta subasta.");
    } catch (error) {
      console.error(error);
      alert("No se pudo quitar el like.");
    }
  };

  // --- LÓGICA: CREAR SUBASTA (tarea 2) ---
  const manejarCrearSubasta = async (e) => {
    e.preventDefault();
    try {
      const productoIdElegido = parseInt(productoIdSubasta);

      // Los input datetime-local devuelven "2025-08-01T10:00" en hora LOCAL del navegador.
      // new Date(...) lo interpreta como hora local, y toISOString() lo convierte bien a UTC
      // (agregar ":00Z" a mano estaba mal: trataba la hora local como si ya fuera UTC).
      await API.post('/subastas', {
        producto: { id: productoIdElegido },
        precioBase: parseFloat(precioBaseSubasta),
        incrementoMinimo: parseFloat(incrementoMinimoSubasta),
        fechaInicio: new Date(fechaInicioSubasta).toISOString(),
        fechaCierre: new Date(fechaCierreSubasta).toISOString()
      });

      alert(`¡Subasta creada con éxito! Está en estado BORRADOR — publicala desde "Mis Subastas" para que la gente ya la vea y pueda darle like. Se abrirá para pujar automáticamente en la fecha de inicio que elegiste.`);

      setProductoIdSubasta('');
      setPrecioBaseSubasta('');
      setIncrementoMinimoSubasta('');
      setFechaInicioSubasta('');
      setFechaCierreSubasta('');

      // Refrescamos "Mis Subastas" desde el backend para que aparezca la recién creada
      const misSubastasActualizadas = await API.get('/subastas/mias');
      setMisSubastas(misSubastasActualizadas.data);

      manejarBusqueda();
    } catch (error) {
      console.error(error);
      alert("No se pudo crear la subasta. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: PUBLICAR SUBASTA DESDE "MIS SUBASTAS EN BORRADOR" ---
  const publicarSubastaBorrador = async (subastaId) => {
    try {
      await API.post(`/subastas/${subastaId}/publicar`);
      alert("📢 ¡Subasta publicada! Ya aparece en el listado de Subastas Disponibles. Se activará para pujar automáticamente cuando llegue la fecha de inicio.");

      const misSubastasActualizadas = await API.get('/subastas/mias');
      setMisSubastas(misSubastasActualizadas.data);

      manejarBusqueda();
    } catch (error) {
      console.error(error);
      alert("No se pudo publicar la subasta. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: PUBLICAR SUBASTA (tarea 3) ---
  const publicarSubasta = async (subastaId) => {
    try {
      await API.post(`/subastas/${subastaId}/publicar`);
      alert("📢 ¡Subasta publicada!");
      manejarBusqueda();
    } catch (error) {
      console.error(error);
      alert("No se pudo publicar la subasta. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: CANCELAR SUBASTA (tarea 7) ---
  const cancelarSubasta = async (subastaId) => {
    try {
      await API.post(`/subastas/${subastaId}/cancelar`);
      alert("Subasta cancelada.");
      manejarBusqueda();
    } catch (error) {
      console.error(error);
      alert("No se pudo cancelar. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: VER DETALLE DE UNA SUBASTA (tareas 4 y 5) ---
  const verDetalleSubasta = async (subastaId) => {
    try {
      const respuesta = await API.get(`/subastas/${subastaId}`);
      setSubastaSeleccionada(respuesta.data);

      const respuestaPujas = await API.get(`/subastas/${subastaId}/pujas`);
      setPujas(respuestaPujas.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo cargar el detalle de la subasta.");
    }
  };

  const volverAlListado = () => {
    setSubastaSeleccionada(null);
    setPujas([]);
    setMontoPuja('');
    setMisPujas([]);
  };

  // --- LÓGICA: HACER PUJA (tarea 4) ---
  const manejarPujar = async (e) => {
    e.preventDefault();
    try {
      await API.post(`/subastas/${subastaSeleccionada.id}/pujas`, {
        monto: parseFloat(montoPuja)
      });
      alert("¡Puja registrada con éxito!");
      setMontoPuja('');
      verDetalleSubasta(subastaSeleccionada.id);
    } catch (error) {
      console.error(error);
      alert("No se pudo registrar la puja. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: VER MIS PUJAS EN LA SUBASTA SELECCIONADA ---
  const verMisPujas = async () => {
    try {
      const respuesta = await API.get(`/subastas/${subastaSeleccionada.id}/pujas/mias`);
      setMisPujas(respuesta.data);
    } catch (error) {
      console.error(error);
      alert("No se pudieron cargar tus pujas. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA: ABRIR DISPUTA (subasta ADJUDICADA) ---
  const abrirDisputa = async (e) => {
    e.preventDefault();
    try {
      const respuesta = await API.post(`/subastas/${subastaSeleccionada.id}/disputas`, {
        motivo: motivoDisputa,
        descripcion: descripcionDisputa
      });
      alert(`Disputa abierta. ID de disputa: ${respuesta.data.id} — pasale este número al ADMIN para que la resuelva.`);
      setMotivoDisputa('');
      setDescripcionDisputa('');
      verDetalleSubasta(subastaSeleccionada.id);
    } catch (error) {
      console.error(error);
      alert("No se pudo abrir la disputa. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: BLOQUEAR / DESBLOQUEAR USUARIO (tarea 8) ---
  const bloquearUsuario = async () => {
    try {
      await API.put('/users/block', null, { params: { email: emailAdmin } });
      alert("Usuario bloqueado.");
    } catch (error) {
      console.error(error);
      alert("No se pudo bloquear al usuario. " + (error.response?.data || ''));
    }
  };

  const desbloquearUsuario = async () => {
    try {
      await API.put('/users/unblock', null, { params: { email: emailAdmin } });
      alert("Usuario desbloqueado.");
    } catch (error) {
      console.error(error);
      alert("No se pudo desbloquear al usuario. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: CREAR CATEGORIA (tarea 8) ---
  const crearCategoria = async (e) => {
    e.preventDefault();
    try {
      await API.post('/categorias', { nombre: nombreCategoriaNueva });
      alert("Categoría creada.");
      setNombreCategoriaNueva('');
      const response = await API.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo crear la categoría. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: ELIMINAR CATEGORIA ---
  const eliminarCategoria = async (categoriaId) => {
    try {
      await API.delete(`/categorias/${categoriaId}`);
      alert("Categoría eliminada.");
      const response = await API.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar la categoría. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: EDITAR CATEGORIA ---
  const editarCategoria = async (categoriaId) => {
    try {
      await API.put(`/categorias/${categoriaId}`, { nombre: nombreCategoriaEditado });
      alert("Categoría actualizada.");
      setCategoriaEditandoId(null);
      setNombreCategoriaEditado('');
      const response = await API.get('/categorias');
      setCategorias(response.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo editar la categoría. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: RESOLVER DISPUTA ---
  const resolverDisputa = async () => {
    try {
      await API.post(`/subastas/disputas/${idDisputa}/resolver`, {
        categoriaResolucion: categoriaResolucion
      });
      alert("Disputa resuelta. La subasta volvió a estado BORRADOR.");
      setIdDisputa('');
      setCategoriaResolucion('');

      const response = await API.get('/subastas/disputas/pendientes');
      setDisputasPendientes(response.data);

      manejarBusqueda();
    } catch (error) {
      console.error(error);
      alert("No se pudo resolver la disputa. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL ADMIN: ASIGNAR ROL ADMIN ---
  const asignarAdmin = async () => {
    try {
      await API.post('/users/admin', null, { params: { email: emailAdminAsignar } });
      alert("Rol ADMIN asignado correctamente.");
      setEmailAdminAsignar('');
    } catch (error) {
      console.error(error);
      alert("No se pudo asignar el rol ADMIN. " + (error.response?.data || ''));
    }
  };

  // --- LÓGICA PANEL VENDEDOR: ELIMINAR PRODUCTO ---
  const eliminarProducto = async (productoId) => {
    try {
      await API.delete(`/productos/${productoId}`);
      alert("Producto eliminado.");
      const response = await API.get('/productos');
      setProductos(response.data);
    } catch (error) {
      console.error(error);
      alert("No se pudo eliminar el producto. " + (error.response?.data || ''));
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

  // --- PANTALLA DE DETALLE DE SUBASTA (tareas 4 y 5) ---
  if (subastaSeleccionada) {
    const coloresEstado = {
      ACTIVA: 'green',
      PUBLICADA: 'orange',
      FINALIZADA: 'gray',
      BORRADOR: '#888',
      CANCELADA: 'red',
      ADJUDICADA: 'blue',
      EN_DISPUTA: 'purple'
    };

    return (
        <div style={{ padding: '30px', fontFamily: 'Segoe UI, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
          <button onClick={volverAlListado} style={{ padding: '8px 15px', marginBottom: '20px', cursor: 'pointer' }}>⬅ Volver</button>

          <h2>{subastaSeleccionada.producto?.nombre}</h2>
          <p style={{ color: '#555' }}>{subastaSeleccionada.producto?.descripcion}</p>
          <p><b>Estado:</b> <span style={{ color: coloresEstado[subastaSeleccionada.estado] || 'black', fontWeight: 'bold' }}>{subastaSeleccionada.estado}</span></p>
          <p><b>Precio base:</b> ${subastaSeleccionada.precioBase}</p>
          <p><b>Monto actual:</b> {subastaSeleccionada.montoActual ? `$${subastaSeleccionada.montoActual}` : 'Sin pujas todavía'}</p>
          <p><b>Fecha inicio:</b> {new Date(subastaSeleccionada.fechaInicio).toLocaleString('es-AR')}</p>
          <p><b>Fecha cierre:</b> {new Date(subastaSeleccionada.fechaCierre).toLocaleString('es-AR')}</p>

          {subastaSeleccionada.estado === 'ACTIVA' && (
              <>
                {/* Mismo cálculo que hace el backend: montoActual + incrementoMinimo, o precioBase si no hay pujas */}
                <p style={{ color: '#666' }}>
                  <b>Monto mínimo para pujar:</b> $
                  {subastaSeleccionada.montoActual
                      ? (Number(subastaSeleccionada.montoActual) + Number(subastaSeleccionada.incrementoMinimo)).toFixed(2)
                      : Number(subastaSeleccionada.precioBase).toFixed(2)}
                </p>
                <form onSubmit={manejarPujar} style={{ display: 'flex', gap: '10px', margin: '20px 0' }}>
                  <input type="number" step="0.01" placeholder="Tu monto" value={montoPuja} onChange={(e) => setMontoPuja(e.target.value)} style={{ padding: '8px', flex: '1' }} required />
                  <button type="submit" style={{ padding: '8px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Pujar</button>
                </form>
              </>
          )}

          <h3>Pujas</h3>
          {pujas.length === 0 ? (
              <p style={{ color: '#666' }}>Todavía no hay pujas.</p>
          ) : (
              <ul>
                {pujas.map((p) => (
                    <li key={p.id}>
                      ${p.monto} — {new Date(p.fecha).toLocaleString('es-AR')}
                      {p.oferenteEmail ? ` — ${p.oferenteEmail}` : ''}
                    </li>
                ))}
              </ul>
          )}

          <button onClick={verMisPujas} style={{ padding: '8px 15px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>Ver mis pujas</button>
          {misPujas.length > 0 && (
              <ul>
                {misPujas.map((p) => (
                    <li key={p.id}>${p.monto} — {new Date(p.fecha).toLocaleString('es-AR')}</li>
                ))}
              </ul>
          )}

          {/* --- ABRIR DISPUTA: solo si la subasta está ADJUDICADA --- */}
          {subastaSeleccionada.estado === 'ADJUDICADA' && (
              <div style={{ marginTop: '20px', background: '#fff3cd', padding: '15px', borderRadius: '8px' }}>
                <h4>⚖️ Abrir Disputa</h4>
                <form onSubmit={abrirDisputa} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input type="text" placeholder="Motivo" value={motivoDisputa} onChange={e => setMotivoDisputa(e.target.value)} required style={{ padding: '8px' }} />
                  <textarea placeholder="Descripción detallada" value={descripcionDisputa} onChange={e => setDescripcionDisputa(e.target.value)} required style={{ padding: '8px' }} />
                  <button type="submit" style={{ padding: '8px', background: '#856404', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Abrir Disputa</button>
                </form>
              </div>
          )}
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

        {/* --- NOTIFICACIONES --- */}
        {notificaciones.length > 0 && (
            <div style={{ marginBottom: '20px', background: '#e8f4fd', padding: '15px', borderRadius: '8px', border: '1px solid #bee5eb' }}>
              <h3 style={{ marginTop: 0, color: '#0c5460' }}>🔔 Notificaciones ({notificaciones.length})</h3>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {notificaciones.map(n => (
                    <li key={n.id} style={{ marginBottom: '5px', color: n.leida ? '#888' : '#000' }}>
                      {n.mensaje} — <small>{new Date(n.fecha).toLocaleString('es-AR')}</small>
                    </li>
                ))}
              </ul>
            </div>
        )}

        {/* --- PANEL ADMIN (tarea 8) --- */}
        {roles.includes('ADMIN') && (
            <div style={{ marginBottom: '30px', background: '#fdeef0', padding: '20px', borderRadius: '8px', border: '1px solid #f5c6cb' }}>
              <h3 style={{ marginTop: 0, color: '#721c24' }}>🛠️ Panel de Administrador</h3>

              <h4 style={{ color: '#721c24', marginBottom: '8px' }}>Bloquear / Desbloquear Usuario</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
                <input type="email" placeholder="Email del usuario" value={emailAdmin} onChange={(e) => setEmailAdmin(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
                <button onClick={bloquearUsuario} style={{ padding: '8px 15px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Bloquear</button>
                <button onClick={desbloquearUsuario} style={{ padding: '8px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Desbloquear</button>
              </div>

              <h4 style={{ color: '#721c24', marginBottom: '8px' }}>Agregar Categoría</h4>
              <form onSubmit={crearCategoria} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
                <input type="text" placeholder="Nombre de la categoría" value={nombreCategoriaNueva} onChange={(e) => setNombreCategoriaNueva(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} required />
                <button type="submit" style={{ padding: '8px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Categoría</button>
              </form>

              <h4 style={{ color: '#721c24', marginBottom: '8px' }}>Eliminar Categoría</h4>
              <div style={{ marginBottom: '15px' }}>
                {categorias.map(c => (
                    <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 10px', marginRight: '8px', marginBottom: '8px' }}>
                      {categoriaEditandoId === c.id ? (
                          <>
                            <input type="text" value={nombreCategoriaEditado} onChange={(e) => setNombreCategoriaEditado(e.target.value)} style={{ padding: '4px', border: '1px solid #ccc', borderRadius: '3px' }} />
                            <button onClick={() => editarCategoria(c.id)} style={{ background: '#28a745', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}>Guardar</button>
                          </>
                      ) : (
                          <>
                            {c.nombre}
                            <button onClick={() => { setCategoriaEditandoId(c.id); setNombreCategoriaEditado(c.nombre); }} style={{ background: '#ffc107', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}>✎</button>
                          </>
                      )}
                      <button onClick={() => eliminarCategoria(c.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}>x</button>
                    </span>
                ))}
              </div>

              <h4 style={{ color: '#721c24', marginBottom: '8px' }}>Asignar Rol ADMIN</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
                <input type="email" placeholder="Email del usuario" value={emailAdminAsignar} onChange={(e) => setEmailAdminAsignar(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
                <button onClick={asignarAdmin} style={{ padding: '8px 15px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Asignar ADMIN</button>
              </div>

              <h4 style={{ color: '#721c24', marginBottom: '8px' }}>⚖️ Resolver Disputa</h4>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '15px' }}>
                <select value={idDisputa} onChange={e => setIdDisputa(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '280px' }}>
                  <option value="">Elegí una disputa pendiente</option>
                  {disputasPendientes.map(d => (
                      <option key={d.id} value={d.id}>
                        #{d.id} — {d.subasta?.producto?.nombre} — {d.motivo}
                      </option>
                  ))}
                </select>
                <input type="text" placeholder="Categoría de resolución (ej: Fraude, Acuerdo)" value={categoriaResolucion} onChange={e => setCategoriaResolucion(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
                <button onClick={resolverDisputa} style={{ padding: '8px 15px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Resolver</button>
              </div>
            </div>
        )}

        {/* --- FORMULARIO SOLO VISIBLE PARA VENDEDORES (SELLER) --- */}
        {roles.includes('SELLER') && (
            <div style={{ marginBottom: '30px', background: '#e9f7ef', padding: '20px', borderRadius: '8px', border: '1px solid #c3e6cb' }}>
              <h3 style={{ marginTop: 0, color: '#155724' }}>📦 Panel de Vendedor: Publicar Producto Nuevo</h3>
              <form onSubmit={manejarCrearProducto} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <input type="text" placeholder="Nombre del producto" value={nombreProducto} onChange={(e) => setNombreProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} required />
                <input type="text" placeholder="Descripción..." value={descripcionProducto} onChange={(e) => setDescripcionProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '2' }} required />
                <select value={categoriaProducto} onChange={(e) => setCategoriaProducto(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '180px' }} required>
                  <option value="">Elegí una categoría</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                </select>
                <button type="submit" style={{ padding: '8px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Publicar</button>
              </form>

              {/* --- FORMULARIO CREAR SUBASTA (tarea 2) --- */}
              <h3 style={{ color: '#155724' }}>🔨 Crear Subasta para un Producto</h3>
              <form onSubmit={manejarCrearSubasta} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <select value={productoIdSubasta} onChange={(e) => setProductoIdSubasta(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '220px' }} required>
                  <option value="">Elegí un producto</option>
                  {productos.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.categoria?.nombre})</option>)}
                </select>
                <input type="number" step="0.01" placeholder="Precio Base ($)" value={precioBaseSubasta} onChange={(e) => setPrecioBaseSubasta(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '130px' }} required />
                <input type="number" step="0.01" placeholder="Incremento Mínimo ($)" value={incrementoMinimoSubasta} onChange={(e) => setIncrementoMinimoSubasta(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '160px' }} required />
                <input type="datetime-local" value={fechaInicioSubasta} onChange={(e) => setFechaInicioSubasta(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                <input type="datetime-local" value={fechaCierreSubasta} onChange={(e) => setFechaCierreSubasta(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }} required />
                <button type="submit" style={{ padding: '8px 20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Crear Subasta</button>
              </form>

              {/* --- MIS PRODUCTOS: eliminar producto --- */}
              {productos.length > 0 && (
                  <>
                    <h3 style={{ color: '#155724' }}>📦 Mis Productos</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {productos.map(p => (
                          <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '5px 10px' }}>
                            {p.nombre} ({p.categoria?.nombre})
                            <button onClick={() => eliminarProducto(p.id)} style={{ background: '#dc3545', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', padding: '2px 6px' }}>x</button>
                          </span>
                      ))}
                    </div>
                  </>
              )}
            </div>
        )}

        {/* --- MIS SUBASTAS: todas las del vendedor, sin importar el estado (viene de GET /subastas/mias) --- */}
        {misSubastas.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h3>📂 Mis Subastas</h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {misSubastas.map(s => {
                  const coloresEstadoMini = { BORRADOR: '#888', PUBLICADA: 'orange', ACTIVA: 'green', ADJUDICADA: 'blue', FINALIZADA: 'gray', CANCELADA: 'red', EN_DISPUTA: 'purple' };
                  return (
                      <div key={s.id} style={{ background: '#fff', border: '1px solid #ccc', borderRadius: '4px', padding: '10px 15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span onClick={() => verDetalleSubasta(s.id)} style={{ cursor: 'pointer' }}>
                          <b>{s.producto?.nombre}</b> — <span style={{ color: coloresEstadoMini[s.estado] || 'black', fontWeight: 'bold' }}>{s.estado}</span>
                        </span>
                        {s.estado === 'BORRADOR' && (
                            <button onClick={() => publicarSubastaBorrador(s.id)} style={{ padding: '4px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📢 Publicar</button>
                        )}
                      </div>
                  );
                })}
              </div>
            </div>
        )}

        <div style={{ marginBottom: '30px', background: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #ddd' }}>
          <h3 style={{ marginTop: 0 }}>🔍 Filtrar Subastas</h3>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Buscar por nombre..." value={nombre} onChange={(e) => setNombre(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: '1' }} />
            <input type="number" placeholder="Precio Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }} />
            <input type="number" placeholder="Precio Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '120px' }} />
            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '180px' }}>
              <option value="">Todas las categorías</option>
              {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
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
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '18px', cursor: 'pointer' }} onClick={() => verDetalleSubasta(subasta.id)}>
                      {subasta.producto?.nombre}
                    </h4>
                    <p style={{ color: '#555', fontSize: '14px' }}>{subasta.producto?.descripcion}</p>
                    <p><b>Precio Actual:</b> ${subasta.precioBase}</p>
                    <p><b>Estado:</b> <span style={{ color: subasta.estado === 'ACTIVA' ? 'green' : 'orange', fontWeight: 'bold' }}>{subasta.estado}</span></p>

                    <button onClick={() => verDetalleSubasta(subasta.id)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', marginRight: '10px' }}>
                      Ver Detalle
                    </button>

                    {subasta.estado === 'PUBLICADA' && (
                        misLikes.has(subasta.id) ? (
                            <button onClick={() => quitarLike(subasta.id)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                              💔 Quitar like
                            </button>
                        ) : (
                            <button onClick={() => darLike(subasta.id)} style={{ background: '#ff4d4d', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px' }}>
                              ❤️ Recordar Subasta
                            </button>
                        )
                    )}

                    {roles.includes('SELLER') && subasta.estado === 'BORRADOR' && (
                        <button onClick={() => publicarSubasta(subasta.id)} style={{ background: '#17a2b8', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px' }}>
                          📢 Publicar
                        </button>
                    )}

                    {(roles.includes('ADMIN') || (roles.includes('SELLER') && (subasta.estado === 'PUBLICADA' || subasta.estado === 'BORRADOR'))) && (
                        <button onClick={() => cancelarSubasta(subasta.id)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer', marginTop: '10px', marginLeft: '10px' }}>
                          Cancelar
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
