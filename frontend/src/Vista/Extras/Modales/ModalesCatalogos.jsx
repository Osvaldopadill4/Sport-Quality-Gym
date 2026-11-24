import React from 'react';
import { X, QrCode, Sparkles } from 'lucide-react';

export function ModalFormCliente({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  formData,
  setFormData,
  generarUUID
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="modal-box bg-base-100 p-0 overflow-hidden max-w-lg flex flex-col max-h-[90vh]">
        <div className="gym-modal-header-daisy">
          <h3 className="font-bold text-lg text-base-content flex items-center gap-2">
            <QrCode size={20} className="text-emerald-400" />
            {modalMode === 'create' ? 'Nuevo Cliente' : 'Editar Cliente'}
          </h3>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Nombre Completo * (Máx. 20 caracteres)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Juan Pérez"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Teléfono * (Solo números, máx. 11 dígitos)
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                className="input input-bordered w-full font-mono"
                placeholder="Ej. 3471012962"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Contraseña para App Móvil *
              </label>
              <input
                type="text"
                required
                maxLength={10}
                className="input input-bordered w-full font-mono"
                placeholder="Contraseña (máx. 10 caracteres)"
                value={formData.contrasena || ''}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value.slice(0, 10) })}
              />
              <span className="text-xs text-gray-400 mt-1 block">
                El cliente usará su teléfono y esta contraseña para iniciar sesión en la aplicación móvil.
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-base-content">
                  Token QR / UUID (Torniquete y App)
                </label>
                <button
                  type="button"
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                  onClick={() => setFormData({ ...formData, token_qr: generarUUID() })}
                >
                  <Sparkles size={13} /> Generar Nuevo
                </button>
              </div>
              <input
                type="text"
                maxLength={50}
                className="input input-bordered w-full font-mono text-xs"
                placeholder="GYM-QR-XXXX-XXXX"
                value={formData.token_qr || ''}
                onChange={(e) => setFormData({ ...formData, token_qr: e.target.value.slice(0, 50) })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Contacto de Emergencia (Máx. 20 car.)
                </label>
                <input
                  type="text"
                  maxLength={20}
                  className="input input-bordered w-full"
                  placeholder="Ej. María Pérez"
                  value={formData.contacto_emergencia || ''}
                  onChange={(e) => setFormData({ ...formData, contacto_emergencia: e.target.value.slice(0, 20) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Teléfono Emergencia (Máx. 11 núm.)
                </label>
                <input
                  type="tel"
                  maxLength={11}
                  className="input input-bordered w-full font-mono"
                  placeholder="Ej. 3471012962"
                  value={formData.telefono_emergencia || ''}
                  onChange={(e) => setFormData({ ...formData, telefono_emergencia: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Fecha de Registro
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full"
                  value={formData.fecha_registro || ''}
                  onChange={(e) => setFormData({ ...formData, fecha_registro: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-base-content mb-1">
                  Estado
                </label>
                <select
                  className="input input-bordered w-full"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
                >
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
          </div>

          <div className="gym-modal-footer-daisy">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? 'Agregar Cliente' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ModalFormPlan({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  formData,
  setFormData
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="gym-modal-box-daisy">
        <div className="gym-modal-header-daisy">
          <h3 className="font-bold text-lg text-base-content">
            {modalMode === 'create' ? 'Nuevo Plan de Membresía' : 'Editar Plan'}
          </h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Plan * (máx. 20 caracteres)</label>
              <input
                type="text"
                required
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Semanal, Mensual, Estudiantil..."
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">Precio (MXN) * (máx. 4 cifras)</label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="9999"
                  required
                  className="input input-bordered w-full"
                  placeholder="350 (máx. 9999)"
                  value={formData.precio}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setFormData({ ...formData, precio: val });
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Duración (Días) * (máx. 365)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  required
                  className="input input-bordered w-full"
                  placeholder="30 (máx. 365)"
                  value={formData.duracion_dias}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, '').slice(0, 3);
                    const num = raw && Number(raw) > 365 ? '365' : raw;
                    setFormData({ ...formData, duracion_dias: num });
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Etiqueta / Tipo (máx. 20 caracteres)</label>
              <input
                type="text"
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Más Popular, Promoción, Estudiante..."
                value={formData.tipo_plan || ''}
                onChange={(e) => setFormData({ ...formData, tipo_plan: e.target.value.slice(0, 20) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descripción (máx. 100 caracteres)</label>
              <textarea
                rows="2"
                maxLength={100}
                className="textarea textarea-bordered w-full"
                placeholder="Detalles de la membresía..."
                value={formData.descripcion || ''}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value.slice(0, 100) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estado</label>
              <select
                className="input input-bordered w-full"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="gym-modal-footer-daisy">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? 'Crear Plan' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ModalFormProveedor({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  formData,
  setFormData
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="gym-modal-box-daisy">
        <div className="gym-modal-header-daisy">
          <h3 className="font-bold text-lg text-base-content">
            {modalMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          </h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Nombre de la Empresa * (Máx. 20 caracteres)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Suplementos GymFit"
                value={formData.nombre_empresa}
                onChange={(e) => setFormData({ ...formData, nombre_empresa: e.target.value.slice(0, 20) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Persona de Contacto (Máx. 20 caracteres)
              </label>
              <input
                type="text"
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Carlos Ortiz"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Correo Electrónico (Debe contener @ y .com)
              </label>
              <input
                type="email"
                maxLength={50}
                className="input input-bordered w-full"
                placeholder="contacto@empresa.com"
                value={formData.correo || ''}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value.slice(0, 50) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Teléfono (Solo números, máx. 11 dígitos)
              </label>
              <input
                type="tel"
                maxLength={11}
                className="input input-bordered w-full font-mono"
                placeholder="Ej. 3471012962"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">Estado</label>
              <select
                className="input input-bordered w-full"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="gym-modal-footer-daisy">
            <button type="button" onClick={() => setShowModal(false)} className="btn btn-ghost">Cancelar</button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? 'Agregar Proveedor' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}

export function ModalFormUsuario({
  showModal,
  setShowModal,
  modalMode,
  handleSave,
  formData,
  setFormData
}) {
  return (
    <dialog className={`modal ${showModal ? 'modal-open' : ''}`}>
      <div className="gym-modal-box-daisy">
        <div className="gym-modal-header-daisy">
          <h3 className="font-bold text-lg text-base-content">
            {modalMode === 'create' ? 'Nuevo Usuario' : 'Editar Usuario'}
          </h3>
          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto">
            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Nombre * (Máx. 20 caracteres)
              </label>
              <input
                type="text"
                required
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Sofía"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value.slice(0, 20) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Apellido (Máx. 20 caracteres)
              </label>
              <input
                type="text"
                maxLength={20}
                className="input input-bordered w-full"
                placeholder="Ej. Martínez"
                value={formData.apellido || ''}
                onChange={(e) => setFormData({ ...formData, apellido: e.target.value.slice(0, 20) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Correo Electrónico * (Debe contener @ y .com, máx. 50 car.)
              </label>
              <input
                type="email"
                required
                maxLength={50}
                className="input input-bordered w-full"
                placeholder="ejemplo@gymton.com"
                value={formData.correo || ''}
                onChange={(e) => setFormData({ ...formData, correo: e.target.value.slice(0, 50) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Teléfono (Solo números, máx. 11 dígitos)
              </label>
              <input
                type="tel"
                maxLength={11}
                className="input input-bordered w-full font-mono"
                placeholder="Ej. 3471012962"
                value={formData.telefono || ''}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value.replace(/\D/g, '').slice(0, 11) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Contraseña {modalMode === 'create' ? '*' : '(Opcional)'} (Máx. 30 car.)
              </label>
              <input
                type="password"
                required={modalMode === 'create'}
                maxLength={30}
                className="input input-bordered w-full"
                placeholder="••••••••"
                value={formData.contrasena || ''}
                onChange={(e) => setFormData({ ...formData, contrasena: e.target.value.slice(0, 30) })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Rol del Usuario
              </label>
              <select
                className="input input-bordered w-full"
                value={formData.id_rol}
                onChange={(e) => setFormData({ ...formData, id_rol: Number(e.target.value) })}
              >
                <option value={2}>Recepcionista / Empleado (ID 2)</option>
                <option value={3}>Inventario (ID 3)</option>
              </select>
              <span className="text-[11px] text-zinc-400 mt-1 block">
                Carga exclusiva de roles operativos: ID 2 (Recepcionista) e ID 3 (Inventario).
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-base-content mb-1">
                Estado
              </label>
              <select
                className="input input-bordered w-full"
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: Number(e.target.value) })}
              >
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>

          <div className="gym-modal-footer-daisy">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn btn-ghost"
            >
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              {modalMode === 'create' ? 'Agregar Usuario' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
