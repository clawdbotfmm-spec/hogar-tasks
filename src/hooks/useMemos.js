import { useState, useEffect, useCallback, useRef } from 'react';

const MEMOS_URL = 'https://embyfmm.tplinkdns.com:3003/api/v1';
const MEMOS_TOKEN = 'memos_pat_D34nGY6BxMf4AosYv4FMaH9Ko7yPMZvk';
const TAG = '#hogar/lista-compra';
const HEADERS = {
  'Authorization': `Bearer ${MEMOS_TOKEN}`,
  'Content-Type': 'application/json',
};

// Parsear contenido del memo a lista de productos
const parsearMemo = (content) => {
  if (!content) return [];
  return content
    .split('\n')
    .filter(line => line.match(/^- \[[ x]\] /))
    .map((line, i) => {
      const comprado = line.startsWith('- [x] ');
      const resto = line.replace(/^- \[[ x]\] /, '');
      // Formato: "Producto (por Usuario)"
      const match = resto.match(/^(.+?)\s*\(por (.+?)\)$/);
      return {
        id: `memo_${i}`,
        nombre: match ? match[1].trim() : resto.trim(),
        agregadoPor: match ? match[2].trim() : '',
        comprado,
      };
    });
};

// Generar contenido del memo desde la lista
const generarMemo = (productos) => {
  const lineas = productos.map(p => {
    const check = p.comprado ? '[x]' : '[ ]';
    const por = p.agregadoPor ? ` (por ${p.agregadoPor})` : '';
    return `- ${check} ${p.nombre}${por}`;
  });
  return `${TAG}\n${lineas.join('\n')}`;
};

export const useMemos = () => {
  const [listaCompra, setListaCompra] = useState([]);
  const [memoId, setMemoId] = useState(null);
  const [loading, setLoading] = useState(true);
  const pollingRef = useRef(null);

  // Buscar o crear el memo de lista de compra
  const cargarLista = useCallback(async () => {
    try {
      const res = await fetch(`${MEMOS_URL}/memos`, {
        headers: HEADERS,
      });
      const data = await res.json();
      const memoLista = (data.memos || []).find(m =>
        m.tags && m.tags.includes('hogar/lista-compra')
      );

      if (memoLista) {
        const memo = memoLista;
        const id = memo.name.replace('memos/', '');
        setMemoId(id);
        setListaCompra(parsearMemo(memo.content));
      } else {
        // Crear memo nuevo
        const res2 = await fetch(`${MEMOS_URL}/memos`, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({ content: `${TAG}\n`, visibility: 'PRIVATE' }),
        });
        const nuevo = await res2.json();
        const id = nuevo.name.replace('memos/', '');
        setMemoId(id);
        setListaCompra([]);
      }
    } catch (e) {
      console.error('Error cargando lista de Memos:', e);
    }
    setLoading(false);
  }, []);

  // Guardar lista en Memos
  const guardarEnMemos = useCallback(async (productos, id) => {
    const mid = id || memoId;
    if (!mid) return;
    try {
      await fetch(`${MEMOS_URL}/memos/${mid}`, {
        method: 'PATCH',
        headers: HEADERS,
        body: JSON.stringify({ content: generarMemo(productos) }),
      });
    } catch (e) {
      console.error('Error guardando en Memos:', e);
    }
  }, [memoId]);

  // Cargar al inicio
  useEffect(() => {
    cargarLista();
  }, [cargarLista]);

  // Polling cada 15 segundos para sincronizar cambios desde Memos web
  useEffect(() => {
    pollingRef.current = setInterval(() => {
      if (memoId) {
        fetch(`${MEMOS_URL}/memos/${memoId}`, { headers: HEADERS })
          .then(r => r.json())
          .then(memo => {
            if (memo.content) {
              setListaCompra(parsearMemo(memo.content));
            }
          })
          .catch(() => {});
      }
    }, 15000);
    return () => clearInterval(pollingRef.current);
  }, [memoId]);

  // Agregar producto
  const agregarProducto = useCallback(async (nombre, usuario) => {
    const nuevo = {
      id: `memo_${Date.now()}`,
      nombre: nombre.trim(),
      comprado: false,
      agregadoPor: usuario.nombre,
    };
    const nueva = [...listaCompra, nuevo];
    setListaCompra(nueva);
    await guardarEnMemos(nueva);
  }, [listaCompra, guardarEnMemos]);

  // Marcar comprado/no comprado
  const marcarComprado = useCallback(async (productoId, comprado) => {
    const nueva = listaCompra.map(p =>
      p.id === productoId ? { ...p, comprado } : p
    );
    setListaCompra(nueva);
    await guardarEnMemos(nueva);
  }, [listaCompra, guardarEnMemos]);

  // Eliminar producto
  const eliminarProducto = useCallback(async (productoId) => {
    const nueva = listaCompra.filter(p => p.id !== productoId);
    setListaCompra(nueva);
    await guardarEnMemos(nueva);
  }, [listaCompra, guardarEnMemos]);

  // Limpiar comprados
  const limpiarComprados = useCallback(async () => {
    const nueva = listaCompra.filter(p => !p.comprado);
    setListaCompra(nueva);
    await guardarEnMemos(nueva);
  }, [listaCompra, guardarEnMemos]);

  return {
    listaCompra,
    loading,
    agregarProducto,
    marcarComprado,
    eliminarProducto,
    limpiarComprados,
  };
};
