package com.dphotel.service;

import com.dphotel.dto.AuthDtos;
import com.dphotel.entity.User;
import com.dphotel.repository.UserRepository;
import com.dphotel.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthDtos.AuthResponseData register(AuthDtos.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String id = UUID.randomUUID().toString();
        String hashedPassword = passwordEncoder.encode(request.getPassword());

        User user = new User(
                id,
                request.getEmail().toLowerCase().trim(),
                hashedPassword,
                request.getFirstName().trim(),
                request.getLastName().trim(),
                request.getPhone(),
                request.getAddress(),
                "user"
        );

        userRepository.save(user);

        String token = tokenProvider.generateToken(user.getId());

        AuthDtos.UserDto userDto = new AuthDtos.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );

        return new AuthDtos.AuthResponseData(userDto, token);
    }

    public AuthDtos.AuthResponseData login(AuthDtos.LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        String token = tokenProvider.generateToken(user.getId());

        AuthDtos.UserDto userDto = new AuthDtos.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );

        return new AuthDtos.AuthResponseData(userDto, token);
    }

    public AuthDtos.UserDto getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new AuthDtos.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );
    }

    @Transactional
    public AuthDtos.UserDto updateProfile(String userId, AuthDtos.UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());

        userRepository.save(user);

        return new AuthDtos.UserDto(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhone(),
                user.getAddress(),
                user.getRole()
        );
    }
}
