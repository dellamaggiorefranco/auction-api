package com.subastas.subastas_api.config;

import com.subastas.subastas_api.entity.Role;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.exception.RolNoEncontradoException;
import com.subastas.subastas_api.repository.RoleRepository;
import com.subastas.subastas_api.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class UserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserInitializer(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        // Crear roles si no existen
        if (!roleRepository.existsByName("USER")) {
            Role role = new Role();
            role.setName("USER");
            roleRepository.save(role);
        }
        if (!roleRepository.existsByName("SELLER")) {
            Role role = new Role();
            role.setName("SELLER");
            roleRepository.save(role);
        }
        if (!roleRepository.existsByName("ADMIN")) {
            Role role = new Role();
            role.setName("ADMIN");
            roleRepository.save(role);
        }

        // Crear usuario ADMIN de prueba
        if (!userRepository.existsByEmail("admin@test.com")) {
            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new RolNoEncontradoException("ADMIN"));

            User admin = new User();
            admin.setName("Admin");
            admin.setEmail("admin@test.com");
            admin.setPassword(passwordEncoder.encode("admin1234"));
            admin.getRoles().add(adminRole);
            userRepository.save(admin);
        }

        // Crear usuario USER de prueba
        if (!userRepository.existsByEmail("franco@test.com")) {
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RolNoEncontradoException("USER"));

            User user = new User();
            user.setName("Franco");
            user.setEmail("franco@test.com");
            user.setPassword(passwordEncoder.encode("franco1234"));
            user.getRoles().add(userRole);
            userRepository.save(user);
        }
    }
}
