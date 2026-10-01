package com.nilev.notification.config;

import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;
import com.nilev.notification.repository.NotificationRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("!test")
@Order(140)
public class NotificationSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(NotificationSeedInitializer.class);

    private final NotificationRepository notifRepo;
    private final UserRepository userRepo;

    public NotificationSeedInitializer(NotificationRepository notifRepo, UserRepository userRepo) {
        this.notifRepo = notifRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (notifRepo.count() > 0) {
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.size() < 2) {
                return;
            }

            User user1 = users.get(0);
            User user2 = users.get(1);

            log.info("Seeding realistic showcase notifications for {} and {}", user1.getName(), user2.getName());

            // 1. Surprise received by User 1 (from User 2) - UNREAD
            notifRepo.save(Notification.builder()
                    .user(user1)
                    .actor(user2)
                    .type(NotificationType.SURPRISE_RECEIVED)
                    .title("Someone has a surprise for you ✨")
                    .message(user2.getName() + " left a sealed surprise in your sanctuary. Tap to unseal!")
                    .icon("🎁")
                    .actionUrl("/surprises")
                    .build());

            // 2. Goal Milestone by User 1 & 2 - UNREAD
            notifRepo.save(Notification.builder()
                    .user(user1)
                    .actor(user2)
                    .type(NotificationType.GOAL_MILESTONE)
                    .title("Milestone Reached (75%) 🎯")
                    .message("Kyoto Autumn Journey Fund reached 75%! You both saved $3,750 together.")
                    .icon("🎯")
                    .actionUrl("/goals")
                    .build());

            // 3. Companion Level Up - READ
            Notification n3 = Notification.builder()
                    .user(user1)
                    .actor(user1)
                    .type(NotificationType.COMPANION_LEVEL_UP)
                    .title("Nova Leveled Up to Level 4! ⭐")
                    .message("Your wolf companion resonated with your consistency and evolved.")
                    .icon("🐺")
                    .actionUrl("/companion")
                    .build();
            n3.markAsRead();
            notifRepo.save(n3);

            // 4. Partner Connected - READ
            Notification n4 = Notification.builder()
                    .user(user1)
                    .actor(user2)
                    .type(NotificationType.PARTNER_CONNECTED)
                    .title("Sanctuary Bond Connected 💞")
                    .message("You and " + user2.getName() + " are now paired in your private space.")
                    .icon("💞")
                    .actionUrl("/partner")
                    .build();
            n4.markAsRead();
            notifRepo.save(n4);

            // Notifications for User 2 (Maya)
            notifRepo.save(Notification.builder()
                    .user(user2)
                    .actor(user1)
                    .type(NotificationType.SURPRISE_OPENED)
                    .title("Surprise Unsealed! 💖")
                    .message(user1.getName() + " opened your 'Golden Matcha Soufflé Pass'.")
                    .icon("💌")
                    .actionUrl("/surprises")
                    .build());

            notifRepo.save(Notification.builder()
                    .user(user2)
                    .actor(user1)
                    .type(NotificationType.GOAL_MILESTONE)
                    .title("Kyoto Fund Reached 75% 🎯")
                    .message("Shared goal reached 75% with contributions from " + user1.getName() + ".")
                    .icon("🎯")
                    .actionUrl("/goals")
                    .build());

            log.info("Notifications successfully seeded.");
        } catch (Exception e) {
            log.error("Failed to seed notifications: {}", e.getMessage(), e);
        }
    }
}
