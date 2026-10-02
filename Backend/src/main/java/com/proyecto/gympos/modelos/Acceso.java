package com.proyecto.gympos.modelos;

public class Acceso {
    private String id_acceso;
    private String id_cliente;
    private String fecha;
    private String hora;
    private String resultado;

    public String getId_acceso() {
        return id_acceso;
    }

    public void setId_acceso(String id_acceso) {
        this.id_acceso = id_acceso;
    }

    public String getId_cliente() {
        return id_cliente;
    }

    public void setId_cliente(String id_cliente) {
        this.id_cliente = id_cliente;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getHora() {
        return hora;
    }

    public void setHora(String hora) {
        this.hora = hora;
    }

    public String getResultado() {
        return resultado;
    }

    public void setResultado(String resultado) {
        this.resultado = resultado;
    }
}
