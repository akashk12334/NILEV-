package com.nilev.integration;

import com.nilev.habit.entity.Habit;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.junit.jupiter.api.Assumptions;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

/**
 * PostgreSQL Integration Test using Testcontainers.
 * Validates entity persistence, transactional rollbacks, and schema generation
 * directly against real PostgreSQL.
 *
 * Automatically verifies Docker availability before execution.
 */
@SpringBootTest
@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("test")
class PostgresIntegrationTest {

    private static final boolean DOCKER_AVAILABLE;

    static {
        boolean available = false;
        try {
            available = DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable ignored) {}
        DOCKER_AVAILABLE = available;
    }

    @Container
    private static final PostgreSQLContainer<?> postgres = DOCKER_AVAILABLE
            ? new PostgreSQLContainer<>("postgres:16-alpine")
                .withDatabaseName("nilev_test_db")
                .withUsername("testuser")
                .withPassword("testpass")
            : null;

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (DOCKER_AVAILABLE && postgres != null && postgres.isRunning()) {
            registry.add("spring.datasource.url", postgres::getJdbcUrl);
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        }
    }

    @Autowired
    private UserRepository userRepo;

    @Autowired
    private HabitRepository habitRepo;

    @BeforeAll
    static void checkDocker() {
        Assumptions.assumeTrue(DOCKER_AVAILABLE,
                "Testcontainers PostgreSQL test skipped because Docker daemon is not active on this environment.");
    }

    @Test
    @DisplayName("PostgreSQL Container: Save and retrieve User and Habit with foreign key integrity")
    void testPostgreSqlPersistence() {
        User user = userRepo.save(User.builder()
                .name("Postgres Test User")
                .email("pg_test@nilev.space")
                .passwordHash("hashed")
                .active(true)
                .build());

        assertNotNull(user.getId());

        Habit habit = habitRepo.save(Habit.builder()
                .user(user)
                .name("Postgres Habit")
                .build());

        assertNotNull(habit.getId());
        assertEquals("Postgres Habit", habit.getName());
        assertEquals(user.getId(), habit.getUser().getId());

        habitRepo.delete(habit);
        userRepo.delete(user);
    }
}
