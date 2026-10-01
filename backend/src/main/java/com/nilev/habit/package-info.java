/**
 * Habit Module.
 * Responsible for individual and joint habit tracking, streaks, and check-ins.
 *
 * Layered structure:
 * - {@code controller}: REST controllers consuming and returning DTOs
 * - {@code service}: Business services interface and implementation
 * - {@code repository}: JPA repositories
 * - {@code entity}: Domain JPA entities
 * - {@code dto}: Request and response transfer objects
 */
package com.nilev.habit;
