import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, QrCode, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

export function ModalCamaraAcceso({
  isOpen,
  onClose,
  onScan,
  cooldownRestante,
  setCooldownRestante
}) {
  const [iniciando, setIniciando] = useState(true);
  const [errorCamara, setErrorCamara] = useState(null);
  const scannerRef = useRef(null);
  const isScanningRef = useRef(false);
  const cooldownRef = useRef(cooldownRestante);
  const onScanRef = useRef(onScan);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    cooldownRef.current = cooldownRestante;
  }, [cooldownRestante]);

  useEffect(() => {
    onScanRef.current = onScan;
    onCloseRef.current = onClose;
  }, [onScan, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    setIniciando(true);
    setErrorCamara(null);
    isScanningRef.current = false;

    const elementoId = 'lector-qr-webcam-container';
    let html5QrCode = null;

    try {
      html5QrCode = new Html5Qrcode(elementoId);
      scannerRef.current = html5QrCode;

      html5QrCode.start(
        { facingMode: 'user' },
        {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          if (cooldownRef.current > 0) {
            return;
          }
          if (setCooldownRestante) {
            setCooldownRestante(10);
          }
          // Cerrar la cámara inmediatamente para liberar recursos
          if (onCloseRef.current) {
            onCloseRef.current();
          }
          if (onScanRef.current) {
            onScanRef.current(decodedText);
          }
        },
        () => {
          // Ignorar frames sin código QR detectado
        }
      ).then(() => {
        isScanningRef.current = true;
        setIniciando(false);
      }).catch((err) => {
        console.error('Error al inicializar cámara web:', err);
        setErrorCamara('No se pudo acceder a la cámara web. Verifica que tu navegador tenga permiso para usar la cámara.');
        setIniciando(false);
      });
    } catch (err) {
      console.error(err);
      setErrorCamara('Error al inicializar el escáner de cámara.');
      setIniciando(false);
    }

    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        if (isScanningRef.current) {
          isScanningRef.current = false;
          scanner.stop().then(() => {
            try { scanner.clear(); } catch {}
          }).catch(() => {
            try { scanner.clear(); } catch {}
          });
        } else {
          try { scanner.clear(); } catch {}
        }
      }
    };
  }, [isOpen, setCooldownRestante]);

  if (!isOpen) return null;

  return (
    <div className="gym-modal-backdrop" onClick={onClose}>
      <div
        className="gym-modal-container max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 bg-zinc-800 border-b border-zinc-700 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <QrCode size={18} className="text-emerald-400" />
            <span>Registrar acceso — Escáner Cámara Web</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center">
          {/* Indicador de Cooldown de 30 Segundos */}
          {cooldownRestante > 0 ? (
            <div className="w-full mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between text-xs text-amber-300">
              <span className="flex items-center gap-2 font-bold">
                <Clock size={16} className="animate-spin text-amber-400" />
                Enfriamiento de seguridad activo (10 segundos)
              </span>
              <span className="font-mono font-black text-sm px-2 py-0.5 bg-amber-500/20 rounded-lg">
                {cooldownRestante}s
              </span>
            </div>
          ) : (
            <div className="w-full mb-4 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-semibold">
              <ShieldCheck size={16} />
              <span>Cámara lista: Enfoca el código QR de la App Móvil para registrar el acceso</span>
            </div>
          )}

          {/* Visor de Video de la Cámara */}
          <div className="relative w-full max-w-[320px] aspect-square rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/40 shadow-inner flex items-center justify-center">
            <div id="lector-qr-webcam-container" className="w-full h-full" />

            {iniciando && (
              <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center gap-2 text-xs text-zinc-400">
                <span className="loading loading-spinner text-emerald-400" />
                <span>Iniciando cámara web...</span>
              </div>
            )}

            {errorCamara && (
              <div className="absolute inset-0 bg-zinc-950 p-6 flex flex-col items-center justify-center text-center gap-3">
                <AlertCircle size={32} className="text-red-400" />
                <span className="text-xs text-red-300 leading-relaxed">{errorCamara}</span>
                <span className="text-[11px] text-zinc-500">Asegúrate de permitir el acceso a la cámara en el navegador.</span>
              </div>
            )}
          </div>

          <p className="text-xs text-zinc-400 text-center mt-4">
            El sistema va a validar el token de la App Móvil y valida la vigencia.
          </p>

          <div className="flex justify-end w-full mt-4 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost text-zinc-400 hover:text-white"
            >
              Cerrar Cámara
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
