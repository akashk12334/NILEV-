package com.nilev.user.config;

import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;

@Component
@Profile("!test")
@Order(10)
public class UserSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(UserSeedInitializer.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PartnerConnectionRepository partnerConnectionRepository;

    public UserSeedInitializer(UserRepository userRepository,
                               PasswordEncoder passwordEncoder,
                               PartnerConnectionRepository partnerConnectionRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.partnerConnectionRepository = partnerConnectionRepository;
    }

    @Override
    public void run(String... args) {
        try {
            if (userRepository.count() > 0) {
                return;
            }

            log.info("Initializing NILEV default demo partner accounts (Alex & Maya)...");

            String passwordHash = passwordEncoder.encode("Password123!");

            User alex = User.builder()
                    .name("Alex Rivers")
                    .email("alex@nilev.com")
                    .passwordHash(passwordHash)
                    .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80")
                    .role("USER")
                    .active(true)
                    .xp(340)
                    .level(3)
                    .streak(5)
                    .companionName("Luna")
                    .companionType("Wolf")
                    .companionLevel(3)
                    .companionMood("Empowered")
                    .habitsCompletedCount(18)
                    .goalsCount(4)
                    .lastLoginAt(Instant.now())
                    .build();

            User maya = User.builder()
                    .name("Maya Lin")
                    .email("maya@nilev.com")
                    .passwordHash(passwordHash)
                    .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=256&q=80")
                    .role("USER")
                    .active(true)
                    .xp(420)
                    .level(4)
                    .streak(7)
                    .companionName("Sol")
                    .companionType("Fox")
                    .companionLevel(4)
                    .companionMood("Radiant")
                    .habitsCompletedCount(24)
                    .goalsCount(5)
                    .lastLoginAt(Instant.now().minus(Duration.ofHours(1)))
                    .build();

            User savedAlex = userRepository.save(alex);
            User savedMaya = userRepository.save(maya);

            PartnerConnection connection = new PartnerConnection(
                    savedAlex,
                    savedMaya,
                    Instant.now().minus(Duration.ofDays(60)),
                    true,
                    14
            );
            partnerConnectionRepository.save(connection);

            log.info("Demo partner accounts initialized successfully: alex@nilev.com & maya@nilev.com (connected)");
        } catch (Exception e) {
            log.error("Failed to seed default demo users: {}", e.getMessage(), e);
        }
    }
}
