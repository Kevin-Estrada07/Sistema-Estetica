# Instrucciones para Agregar el Logo de la Estética

## ✅ Cambios Realizados

He actualizado los siguientes archivos para que el logo sea clickeable:

1. **Header.jsx** - El logo en la página principal ahora es clickeable y regresa al inicio de la página
2. **Sidebar.jsx** - El logo en el sidebar ahora es clickeable y regresa al dashboard
3. **Sidebar.css** - Agregué estilos para el logo clickeable

## 📝 Cómo Agregar Tu Logo Personalizado

### Paso 1: Agregar el archivo del logo

1. Coloca tu archivo de logo (puede ser `.png`, `.jpg`, `.svg`, etc.) en la carpeta:
   ```
   Frontend/public/images/
   ```
   
2. Renombra el archivo a algo simple como `logo.png` o `logo.svg`

### Paso 2: Actualizar el Header (Página Principal)

Abre el archivo `Frontend/src/components/Header.jsx` y reemplaza las líneas 34-39:

**Antes:**
```jsx
{/* Puedes reemplazar esto con <img src="/ruta-al-logo.png" alt="Logo Estética Bella" /> */}
<h1>
  <span className="logo-main">Estética</span>
  <span className="logo-accent">Bella</span>
</h1>
<div className="logo-underline"></div>
```

**Después:**
```jsx
<img 
  src="/images/logo.png" 
  alt="Logo Estética Bella" 
  style={{ height: '50px', width: 'auto' }}
/>
```

### Paso 3: Actualizar el Sidebar

Abre el archivo `Frontend/src/components/Sidebar.jsx` y reemplaza las líneas 46-47:

**Antes:**
```jsx
{/* Puedes reemplazar esto con <img src="/ruta-al-logo.png" alt="Logo" className="sidebar-logo-img" /> */}
<h2 className="sidebar-logo">✨ ESTÉTICA</h2>
```

**Después:**
```jsx
<img 
  src="/images/logo.png" 
  alt="Logo Estética" 
  className="sidebar-logo-img"
/>
```

### Paso 4: Ajustar el tamaño del logo (Opcional)

Si necesitas ajustar el tamaño del logo en el sidebar, edita el archivo `Frontend/src/styles/Sidebar.css`:

```css
.sidebar-logo-img {
  width: 100%;
  max-width: 150px;  /* Ajusta este valor según necesites */
  height: auto;
  display: block;
  margin: 0 auto 0.5rem;
}
```

## 🎨 Recomendaciones para el Logo

- **Formato recomendado**: PNG con fondo transparente o SVG
- **Tamaño recomendado para Header**: 200-300px de ancho
- **Tamaño recomendado para Sidebar**: 150-200px de ancho
- **Relación de aspecto**: Horizontal o cuadrado funciona mejor

## ✨ Funcionalidad Actual

- ✅ **Header**: Al hacer clic en el logo, la página se desplaza suavemente al inicio
- ✅ **Sidebar**: Al hacer clic en el logo, te redirige al Dashboard
- ✅ **Efecto hover**: El logo del sidebar tiene un efecto de zoom al pasar el mouse

## 🔧 Si Tienes Problemas

Si el logo no se muestra:
1. Verifica que el archivo esté en `Frontend/public/images/`
2. Verifica que el nombre del archivo coincida con el que pusiste en el código
3. Recarga la página con Ctrl + F5 (Windows) o Cmd + Shift + R (Mac)

