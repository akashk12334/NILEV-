package com.nilev.surprise.config;

import com.nilev.surprise.entity.Surprise;
import com.nilev.surprise.entity.SurpriseStatus;
import com.nilev.surprise.entity.SurpriseType;
import com.nilev.surprise.repository.SurpriseRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@Profile("!test")
@Order(130)
public class SurpriseSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(SurpriseSeedInitializer.class);

    private final SurpriseRepository surpriseRepo;
    private final UserRepository userRepo;

    public SurpriseSeedInitializer(SurpriseRepository surpriseRepo, UserRepository userRepo) {
        this.surpriseRepo = surpriseRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (surpriseRepo.count() > 0) {
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.size() < 2) {
                return;
            }

            User user1 = users.get(0);
            User user2 = users.get(1);

            log.info("Seeding realistic showcase surprises between {} and {}", user1.getName(), user2.getName());

            // 1. Surprise for User 1 (from User 2): DELIVERED (Unopened) - "Someone has a surprise for you ✨"
            Surprise s1 = Surprise.builder()
                    .sender(user2)
                    .receiver(user1)
                    .type(SurpriseType.MESSAGE)
                    .title("Midnight Starlight Note 💌")
                    .content("I noticed how diligently you kept up your meditation habit this week. I am so proud of your quiet consistency. Meet me on the terrace at 10 PM for tea.")
                    .status(SurpriseStatus.DELIVERED)
                    .build();
            surpriseRepo.save(s1);

            // 2. Surprise for User 1 (from User 2): OPENED - Reward Coupon
            Surprise s2 = Surprise.builder()
                    .sender(user2)
                    .receiver(user1)
                    .type(SurpriseType.REWARD)
                    .title("Golden Matcha Soufflé Pass 🍵")
                    .content("Redeemable for one slow morning in bed with freshly whisked Uji matcha and fluffy vanilla soufflé pancakes crafted by yours truly.")
                    .status(SurpriseStatus.OPENED)
                    .openedAt(LocalDateTime.now().minusDays(1))
                    .build();
            surpriseRepo.save(s2);

            // 3. Sent by User 1 to User 2: DELIVERED
            Surprise s3 = Surprise.builder()
                    .sender(user1)
                    .receiver(user2)
                    .type(SurpriseType.MEMORY)
                    .title("The Rain Walk in Shinjuku 🌧️")
                    .content("Remember when the skies opened up and we had only one umbrella between us? We ended up laughing under the station eaves for an hour eating warm taiyaki. Best rainy afternoon ever.")
                    .status(SurpriseStatus.DELIVERED)
                    .build();
            surpriseRepo.save(s3);

            // 4. Scheduled Surprise by User 1 to User 2: SCHEDULED (Time-locked)
            Surprise s4 = Surprise.builder()
                    .sender(user1)
                    .receiver(user2)
                    .type(SurpriseType.CUSTOM)
                    .title("Secret Anniversary Escape ✈️")
                    .content("Pack a light weekend bag with warm layers and comfortable walking shoes. We have a cozy cabin with an onsen reserved under the stars.")
                    .scheduledAt(LocalDateTime.now().plusDays(5))
                    .status(SurpriseStatus.SCHEDULED)
                    .build();
            surpriseRepo.save(s4);

            // 5. Playful Challenge from User 2 to User 1: DELIVERED
            Surprise s5 = Surprise.builder()
                    .sender(user2)
                    .receiver(user1)
                    .type(SurpriseType.CHALLENGE)
                    .title("Sunset No-Phone Walk Dare ⚡")
                    .content("I challenge you to leave both our phones in airplane mode for 45 minutes while we walk by the river and listen to the birds.")
                    .status(SurpriseStatus.DELIVERED)
                    .build();
            surpriseRepo.save(s5);

            log.info("Surprises successfully seeded.");
        } catch (Exception e) {
            log.error("Failed to seed surprises: {}", e.getMessage(), e);
        }
    }
}
