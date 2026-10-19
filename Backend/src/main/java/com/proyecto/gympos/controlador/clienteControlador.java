package com.proyecto.gympos.controlador;

import com.proyecto.gympos.dao.ClienteDao;
import com.proyecto.gympos.modelos.Cliente;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:3000")
public class clienteControlador {
    @Autowired
    private ClienteDao clienteDao;
    //Listar datos de cliente
    @RequestMapping (value = "api/cliente", method = RequestMethod.GET)
    public List<Cliente> getClientes(){
        return clienteDao.getClientes();
    }
    //Registrar los datos del cliente
    @RequestMapping (value = "api/cliente" , method = RequestMethod.POST)
    public Cliente registrarCliente(@RequestBody Cliente cliente){
        clienteDao.registrar(cliente);
        return cliente;
    }
    //Editar cliente
    @RequestMapping (value = "api/cliente/{id}" , method = RequestMethod.PUT)
    public Cliente editarCliente(@PathVariable int id, @RequestBody Cliente cliente) {
        cliente.setId(id);
        clienteDao.actualizar(cliente);
        return cliente;
    }
    //Eliminar cliente
    @RequestMapping(value = "api/cliente/{id}" , method = RequestMethod.DELETE)
    public void eliminar(@PathVariable int id) {
        clienteDao.eliminar(id);
    }


}
