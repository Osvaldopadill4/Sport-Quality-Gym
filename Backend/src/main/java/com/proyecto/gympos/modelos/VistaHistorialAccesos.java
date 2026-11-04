package com.proyecto.gympos.modelos;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "vw_historial_accessos")
public class VistaHistorialAccesos {
    @Id
    @GeneratedValue(strategy = jakarta.persistence.GenerationType.IDENTITY)
    @Getter @Setter @Column(name = "id_acceso")
    private int id_acceso;
    @Getter @Setter @Column(name = "id_cliente")
    private int id_cliente;
    @Getter @Setter @Column(name = "cliente")
    private String cliente;
    @Getter @Setter @Column(name = "fecha")
    private String fecha;
    @Getter @Setter @Column(name = "hora")
    private String hora;
    @Getter @Setter @Column(name = "resultado")
    private String resultado;
}
