package com.nilev.config;

import org.hibernate.boot.MetadataSources;
import org.hibernate.boot.registry.StandardServiceRegistry;
import org.hibernate.boot.registry.StandardServiceRegistryBuilder;
import org.hibernate.dialect.PostgreSQLDialect;
import org.hibernate.engine.spi.SessionFactoryImplementor;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class HibernateDialectVerificationTest {

    @Test
    @DisplayName("Verify Hibernate 6 initializes PostgreSQLDialect cleanly without requiring JDBC metadata")
    void testPostgreSqlDialectInitialization() {
        Map<String, Object> settings = new HashMap<>();
        settings.put("hibernate.dialect", "org.hibernate.dialect.PostgreSQLDialect");
        settings.put("hibernate.hbm2ddl.auto", "none");

        StandardServiceRegistry registry = new StandardServiceRegistryBuilder()
                .applySettings(settings)
                .build();

        try {
            MetadataSources metadataSources = new MetadataSources(registry);
            var metadata = metadataSources.buildMetadata();
            try (SessionFactoryImplementor sessionFactory = (SessionFactoryImplementor) metadata.buildSessionFactory()) {
                assertNotNull(sessionFactory);
                assertNotNull(sessionFactory.getJdbcServices());
                assertTrue(sessionFactory.getJdbcServices().getDialect() instanceof PostgreSQLDialect,
                        "Dialect must be an instance of PostgreSQLDialect");
            }
        } finally {
            StandardServiceRegistryBuilder.destroy(registry);
        }
    }
}

