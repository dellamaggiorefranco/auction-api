package com.subastas.subastas_api.service;

import com.subastas.subastas_api.entity.Role;
import com.subastas.subastas_api.entity.User;
import com.subastas.subastas_api.exception.*;
import com.subastas.subastas_api.repository.RoleRepository;
import com.subastas.subastas_api.repository.UserRepository;
import com.subastas.subastas_api.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // Registro
    public void register(String name, String email, String password) {

            // 1. Verificar que el email no esté en uso
            if (userRepository.existsByEmail(email)) {
                throw new EmailYaEnUsoException(email);
            }

            // 2. Crear el usuario
            User user = new User();
            user.setName(name);
            user.setEmail(email);

            // 3. Encriptar el password
            user.setPassword(passwordEncoder.encode(password));

            // 4. Buscar el rol USER y asignarlo
            Role userRole = roleRepository.findByName("USER")
                    .orElseThrow(() -> new RolNoEncontradoException("USER"));
            user.setRoles(Set.of(userRole));

            // 5. Guardar
            userRepository.save(user);
    }

    // Login
    public String login(String email, String password) {

        // 1. Buscar el usuario
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException(email));

        // 2. Verificar el password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new CredencialesInvalidasException();
        }

        // 3. Generar y devolver el token
        return jwtService.generateToken(user.getEmail());
    }

    // Auto-asignacion de rol SELLER
    public void assignSellerRole(String email) {

        // 1. Buscar el usuario
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException(email));

        // 2. Buscar el rol SELLER
        Role sellerRole = roleRepository.findByName("SELLER")
                .orElseThrow(() -> new RolNoEncontradoException("SELLER"));

        // 3. Agregarlo si no lo tiene ya
        if (user.getRoles().contains(sellerRole)) {
            throw new RolYaAsignadoException("SELLER");
        }

        user.getRoles().add(sellerRole);
        userRepository.save(user);
    }

    // Asignacion de rol ADMIN por OTRO ADMIN
    public void assignAdminRole(String emailObjetivo) {

        // 1. Buscar el usuario al que le queremos dar el rol
        User user = userRepository.findByEmail(emailObjetivo)
                .orElseThrow(() -> new UsuarioNoEncontradoException(emailObjetivo));

        // 2. Buscar el rol ADMIN
        Role adminRole = roleRepository.findByName("ADMIN")
                .orElseThrow(() -> new RolNoEncontradoException("ADMIN"));

        // 3. Verificar que no lo tenga ya
        if (user.getRoles().contains(adminRole)) {
            throw new RolYaAsignadoException("ADMIN");
        }

        user.getRoles().add(adminRole);
        userRepository.save(user);
    }

    // Bloquear usuario
    public void blockUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException(email));

        if (!user.isActive()) {
            throw new UsuarioBloqueadoException();
        }

        user.setActive(false);
        userRepository.save(user);
    }

    // Desbloquear usuario
    public void unblockUser(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsuarioNoEncontradoException(email));

        if (user.isActive()) {
            throw new UsuarioYaActivoException();
        }

        user.setActive(true);
        userRepository.save(user);
    }
}
