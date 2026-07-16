package in.neupanepralad.esports;

import org.junit.jupiter.api.Test;
import org.flywaydb.core.Flyway;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:migrations;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=validate",
        "spring.flyway.enabled=false"
})
@ActiveProfiles("test")
@ContextConfiguration(initializers = DatabaseMigrationTests.MigrationInitializer.class)
class DatabaseMigrationTests {

    @Test
    void allDatabaseMigrationsApplyAndMatchTheJpaModel() {
    }

    static class MigrationInitializer
            implements ApplicationContextInitializer<ConfigurableApplicationContext> {

        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            var environment = applicationContext.getEnvironment();
            Flyway.configure()
                    .dataSource(
                            environment.getRequiredProperty("spring.datasource.url"),
                            environment.getProperty("spring.datasource.username", "sa"),
                            environment.getProperty("spring.datasource.password", "")
                    )
                    .locations("classpath:db/migration")
                    .load()
                    .migrate();
        }
    }
}
