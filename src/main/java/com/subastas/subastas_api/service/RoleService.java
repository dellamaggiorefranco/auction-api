package com.subastas.subastas_api.service;

import com.subastas.subastas_api.entity.Role;
import com.subastas.subastas_api.repository.RoleRepository;
import org.springframework.stereotype.Service;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    public RoleService(RoleRepository roleRepository) {

        this.roleRepository = roleRepository;
    }

    public void crearRol(String nombre) {
        Role role = new Role();
        role.setName(nombre);
        roleRepository.save(role);
    }
}
