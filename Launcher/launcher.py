
import os
import sys
import time
import socket
import threading
import subprocess
import webbrowser
import tkinter as tk

from tkinter import ttk
from tkinter import messagebox

import pystray
from PIL import Image, ImageDraw


# ==========================================
# CONFIGURACIÓN
# ==========================================

URL = "http://localhost:3000"
PUERTO = 3000
LOCK_PORT = 45873

NPM = r"C:\Program Files\nodejs\npm.cmd"

# ==========================================
# RUTAS
# ==========================================

if getattr(sys, "frozen", False):
    LAUNCHER_DIR = os.path.dirname(sys.executable)
else:
    LAUNCHER_DIR = os.path.dirname(os.path.abspath(__file__))

BASE_DIR = os.path.dirname(LAUNCHER_DIR)
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend")

LOG_PATH = os.path.join(LAUNCHER_DIR, "gympos.log")


# ==========================================
# EVITAR SEGUNDA INSTANCIA DEL LAUNCHER
# ==========================================

lock_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

try:
    lock_socket.bind(("127.0.0.1", LOCK_PORT))
    lock_socket.listen(1)
except OSError:
    sys.exit(0)


# ==========================================
# VARIABLES GLOBALES
# ==========================================

process = None
log_file = None
tray_icon = None

closing = False
browser_opened = False

ventana = None
barra = None
estado = None


# ==========================================
# FUNCIONES
# ==========================================

def servidor_disponible():
    """Comprueba si React ya responde en localhost:3000."""
    try:
        with socket.create_connection(("127.0.0.1", PUERTO), timeout=1):
            return True
    except OSError:
        return False


def crear_icono():
    """Genera el icono de GymPos para la bandeja."""
    imagen = Image.new("RGB", (64, 64), (20, 35, 55))
    dibujo = ImageDraw.Draw(imagen)

    dibujo.rounded_rectangle(
        (5, 5, 59, 59),
        radius=12,
        fill=(20, 35, 55)
    )

    dibujo.text((15, 20), "GP", fill=(255, 255, 255))

    return imagen


def actualizar_estado(mensaje):
    if ventana and ventana.winfo_exists():
        ventana.after(0, lambda: estado.config(text=mensaje))


def abrir_gympos(icon=None, item=None):
    webbrowser.open_new(URL)


def mostrar_estado(icon=None, item=None):
    if servidor_disponible():
        mensaje = "GymPos está funcionando correctamente."
    else:
        mensaje = "GymPos no está respondiendo."

    if ventana and ventana.winfo_exists():
        ventana.after(
            0,
            lambda: messagebox.showinfo("Estado de GymPos", mensaje)
        )


def minimizar_a_bandeja():
    ventana.withdraw()


def sistema_listo():
    global browser_opened

    if closing or browser_opened:
        return

    browser_opened = True

    actualizar_estado("GymPos iniciado correctamente.")

    # ÚNICA apertura automática del navegador.
    webbrowser.open_new(URL)

    ventana.after(1500, ventana.withdraw)


def iniciar_servidor():
    global process, log_file

    if not os.path.isdir(FRONTEND_DIR):
        actualizar_estado("No se encontró la carpeta frontend.")
        return

    if not os.path.isfile(os.path.join(FRONTEND_DIR, "package.json")):
        actualizar_estado("No se encontró package.json.")
        return

    if not os.path.isfile(NPM):
        actualizar_estado("No se encontró npm.cmd.")
        return

    # Evita abrir una segunda instancia de React si ya hay servidor.
    if servidor_disponible():
        ventana.after(0, sistema_listo)
        return

    actualizar_estado("Iniciando GymPos...")

    try:
        log_file = open(LOG_PATH, "a", encoding="utf-8")

        # Impide que React abra automáticamente otra pestaña.
        env = os.environ.copy()
        env["BROWSER"] = "none"

        process = subprocess.Popen(
            f'"{NPM}" start',
            cwd=FRONTEND_DIR,
            shell=True,
            stdout=log_file,
            stderr=subprocess.STDOUT,
            creationflags=subprocess.CREATE_NO_WINDOW,
            env=env
        )

        actualizar_estado("Esperando al servidor...")

        # Esperar hasta que React esté disponible.
        for _ in range(120):
            if closing:
                return

            if process.poll() is not None:
                actualizar_estado("No se pudo iniciar GymPos.")
                return

            if servidor_disponible():
                ventana.after(0, sistema_listo)
                return

            time.sleep(1)

        actualizar_estado("Tiempo de espera agotado.")

    except Exception as e:
        actualizar_estado(f"Error al iniciar: {e}")


def cerrar_aplicacion():
    global closing, process, log_file, tray_icon

    if closing:
        return

    closing = True

    if process and process.poll() is None:
        try:
            subprocess.run(
                ["taskkill", "/PID", str(process.pid), "/T", "/F"],
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW
            )
        except Exception:
            pass

    if log_file:
        try:
            log_file.close()
        except Exception:
            pass

    if tray_icon:
        try:
            tray_icon.stop()
        except Exception:
            pass

    try:
        lock_socket.close()
    except Exception:
        pass

    ventana.destroy()


def salir(icon=None, item=None):
    if ventana and ventana.winfo_exists():
        ventana.after(0, cerrar_aplicacion)


# ==========================================
# ICONO DE BANDEJA
# ==========================================

def iniciar_bandeja():
    global tray_icon

    menu = pystray.Menu(
        pystray.MenuItem(
            "Abrir GymPos",
            abrir_gympos
        ),
        pystray.MenuItem(
            "Estado del sistema",
            mostrar_estado
        ),
        pystray.MenuItem(
            "Salir",
            salir
        )
    )

    tray_icon = pystray.Icon(
        "GymPos",
        crear_icono(),
        "GymPos - Sport Quality Center",
        menu
    )

    tray_icon.run()


# ==========================================
# VENTANA DE INICIO
# ==========================================

def crear_ventana():
    global ventana, barra, estado

    ventana = tk.Tk()
    ventana.title("GymPos")
    ventana.geometry("420x230")
    ventana.resizable(False, False)

    ventana.configure(bg="#142337")

    ventana.protocol("WM_DELETE_WINDOW", minimizar_a_bandeja)

    titulo = tk.Label(
        ventana,
        text="GymPos",
        font=("Segoe UI", 25, "bold"),
        fg="white",
        bg="#142337"
    )
    titulo.pack(pady=(25, 0))

    subtitulo = tk.Label(
        ventana,
        text="SPORT QUALITY CENTER",
        font=("Segoe UI", 9),
        fg="#9FB3C8",
        bg="#142337"
    )
    subtitulo.pack(pady=(0, 20))

    barra = ttk.Progressbar(
        ventana,
        length=300,
        mode="indeterminate"
    )
    barra.pack(pady=10)
    barra.start(10)

    estado = tk.Label(
        ventana,
        text="Preparando GymPos...",
        font=("Segoe UI", 9),
        fg="white",
        bg="#142337"
    )
    estado.pack(pady=10)

    return ventana


# ==========================================
# EJECUCIÓN PRINCIPAL
# ==========================================

def main():
    crear_ventana()

    threading.Thread(
        target=iniciar_bandeja,
        daemon=True
    ).start()

    threading.Thread(
        target=iniciar_servidor,
        daemon=True
    ).start()

    ventana.mainloop()


if __name__ == "__main__":
    main()
