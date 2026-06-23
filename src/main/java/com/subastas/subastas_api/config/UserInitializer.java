package com.subastas.subastas_api.config;

import com.subastas.subastas_api.entity.Role;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.repository.RoleRepository;
import com.subastas.subastas_api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    public UserInitializer(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }


    @Override
    public void run(String... args) {

        if(!userRepository.existsByEmail("franco@test.com")) {

            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RuntimeException("Rol USER no encontrado"));


            User user = new User();

            user.setName("Franco");
            user.setEmail("franco@test.com");
            user.setPassword("123456");


            user.getRoles().add(userRole);


            userRepository.save(user);
        }

    }
}
