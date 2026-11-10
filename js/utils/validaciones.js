/* Validaciones reutilizables (se usan en registro, perfil, recuperar, reservas y admin) */

const V = {
  vacio(v) { return v === null || v === undefined || String(v).trim() === ''; },

  email(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim()); },

  edad(fechaISO) {
    const n = new Date(fechaISO + 'T00:00:00');
    const h = new Date();
    let e = h.getFullYear() - n.getFullYear();
    const m = h.getMonth() - n.getMonth();
    if (m < 0 || (m === 0 && h.getDate() < n.getDate())) e--;
    return e;
  },

  /* Reglas de seguridad de contraseña (5 reglas, el requisito pedía al menos 4) */
  reglasClave(c) {
    return [
      { ok: c.length >= 6 && c.length <= 18, txt: 'Entre 6 y 18 caracteres' },
      { ok: /[A-Z]/.test(c), txt: 'Al menos una letra mayúscula' },
      { ok: /[a-z]/.test(c), txt: 'Al menos una letra minúscula' },
      { ok: /\d/.test(c), txt: 'Al menos un número' },
      { ok: /[^A-Za-z0-9]/.test(c), txt: 'Al menos un carácter especial (!@#$...)' }
    ];
  },
  claveValida(c) { return V.reglasClave(c).every(r => r.ok); },

  pintarReglas(ul, c) {
    ul.innerHTML = V.reglasClave(c)
      .map(r => `<li class="${r.ok ? 'text-success' : 'text-muted'}">${r.ok ? '✔' : '○'} ${r.txt}</li>`)
      .join('');
  },

  /* Mensajes de error por campo: devuelven '' si el valor es válido */
  m: {
    nombre(v) {
      if (V.vacio(v)) return 'Ingresa tu nombre completo';
      if (v.trim().split(/\s+/).length < 2) return 'Ingresa nombre y apellido';
      return '';
    },
    usuario(v) {
      if (V.vacio(v)) return 'Ingresa un nombre de usuario';
      if (!/^[A-Za-z0-9_]{4,20}$/.test(v.trim())) return 'Usa de 4 a 20 letras, números o _';
      return '';
    },
    email(v) {
      if (V.vacio(v)) return 'Ingresa tu correo electrónico';
      if (!V.email(v)) return 'El correo no tiene un formato válido';
      return '';
    },
    nacimiento(v) {
      if (V.vacio(v)) return 'Ingresa tu fecha de nacimiento';
      if (v > Formato.hoyISO()) return 'La fecha no puede ser futura';
      const e = V.edad(v);
      if (e < 13) return 'Debes tener al menos 13 años';
      if (e > 120) return 'La fecha no es válida';
      return '';
    },
    clave(v) {
      if (V.vacio(v)) return 'Ingresa una contraseña';
      if (!V.claveValida(v)) return 'La contraseña no cumple los requisitos';
      return '';
    },
    clave2(v, original) {
      if (V.vacio(v)) return 'Repite la contraseña';
      if (v !== original) return 'Las contraseñas no coinciden';
      return '';
    },
    obligatorio(v, nombre) { return V.vacio(v) ? 'Ingresa ' + nombre : ''; }
  },

  /* Marca el campo como válido/inválido y muestra el mensaje. Devuelve true si es válido. */
  campo(input, msg) {
    const fb = input.parentElement.querySelector('.invalid-feedback') ||
               input.closest('.mb-3, .col, [class*="col-"]')?.querySelector('.invalid-feedback');
    if (msg) {
      input.classList.add('is-invalid');
      input.classList.remove('is-valid');
      if (fb) fb.textContent = msg;
    } else {
      input.classList.remove('is-invalid');
      input.classList.add('is-valid');
    }
    return !msg;
  },

  limpiar(form) {
    form.querySelectorAll('.is-valid, .is-invalid').forEach(e => e.classList.remove('is-valid', 'is-invalid'));
  },

  /* Evita inyección de HTML al mostrar datos escritos por el usuario */
  esc(t) {
    const d = document.createElement('div');
    d.textContent = t == null ? '' : String(t);
    return d.innerHTML;
  }
};
