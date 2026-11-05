package com.nilev.config;

import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;

/**
 * Logs clear startup timing and memory/connection pool metrics when the application is ready.
 * Essential for monitoring Render container cold-start durations and Neon connection states.
 */
@Component
public class StartupTimingListener implements ApplicationListener<ApplicationReadyEvent> {

    private static final Logger log = LoggerFactory.getLogger(StartupTimingListener.class);

    private final DataSource dataSource;

    public StartupTimingListener(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        long uptimeMs = ManagementFactory.getRuntimeMXBean().getUptime();
        Runtime runtime = Runtime.getRuntime();
        long usedMemMb = (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024);
        long maxMemMb = runtime.maxMemory() / (1024 * 1024);

        log.info("=================================================================");
        log.info("NILEV Backend is fully initialized and ready in {} ms ({} s)",
                uptimeMs, String.format("%.2f", uptimeMs / 1000.0));
        log.info("JVM Memory: {} MB used / {} MB max", usedMemMb, maxMemMb);

        if (dataSource instanceof HikariDataSource hikariDataSource) {
            HikariPoolMXBean poolMxBean = hikariDataSource.getHikariPoolMXBean();
            if (poolMxBean != null) {
                log.info("HikariCP Pool [{}]: total={}, active={}, idle={}, waiting={}",
                        hikariDataSource.getPoolName(),
                        poolMxBean.getTotalConnections(),
                        poolMxBean.getActiveConnections(),
                        poolMxBean.getIdleConnections(),
                        poolMxBean.getThreadsAwaitingConnection());
            } else {
                log.info("HikariCP Pool [{}]: maxPoolSize={}",
                        hikariDataSource.getPoolName(),
                        hikariDataSource.getMaximumPoolSize());
            }
        }
        log.info("=================================================================");
    }
}

